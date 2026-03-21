use anchor_lang::prelude::*;
use anchor_lang::system_program;
use anchor_spl::{
    associated_token::AssociatedToken,
    token::{self, Mint, Token, TokenAccount, Transfer},
};

// TODO: After running `anchor build`, get the real program ID with:
//   solana address -k target/deploy/nux_p2p_escrow-keypair.json
// Then replace the string below AND update Anchor.toml [programs.*] sections.
declare_id!("Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFsLnS");

// ─────────────────────────────────────────────────────────────────────────────
//  PROGRAM
// ─────────────────────────────────────────────────────────────────────────────
#[program]
pub mod nux_p2p_escrow {
    use super::*;

    /// One-time setup: initialize the global marketplace state.
    /// Only the admin wallet that calls this will have authority to
    /// update prices, fees, and pause/unpause the market.
    pub fn initialize_marketplace(
        ctx: Context<InitializeMarketplace>,
        fee_basis_points: u16,        // e.g. 200 = 2% platform fee (max 10%)
        reference_price_lamports: u64, // SOL lamports per 1 raw NUX unit (guide for UI)
        min_ad_amount: u64,            // minimum raw NUX units a seller must list
    ) -> Result<()> {
        require!(fee_basis_points <= 1000, EscrowError::FeeTooHigh);
        require!(reference_price_lamports > 0, EscrowError::InvalidPrice);
        require!(min_ad_amount > 0, EscrowError::InvalidAmount);

        let m = &mut ctx.accounts.marketplace;
        m.admin = ctx.accounts.admin.key();
        m.nux_mint = ctx.accounts.nux_mint.key();
        m.fee_basis_points = fee_basis_points;
        m.reference_price_lamports = reference_price_lamports;
        m.min_ad_amount = min_ad_amount;
        m.total_ads = 0;
        m.total_volume_nux = 0;
        m.paused = false;
        m.bump = ctx.bumps.marketplace;

        emit!(MarketplaceInitialized {
            admin: m.admin,
            fee_basis_points,
            reference_price_lamports,
        });
        Ok(())
    }

    /// Admin: update the reference NUX price shown in the UI.
    /// This is a guide price — users can still set their own prices.
    pub fn update_reference_price(
        ctx: Context<AdminInstruction>,
        new_price_lamports: u64,
    ) -> Result<()> {
        require!(new_price_lamports > 0, EscrowError::InvalidPrice);
        ctx.accounts.marketplace.reference_price_lamports = new_price_lamports;
        emit!(PriceUpdated {
            new_price_lamports,
            timestamp: Clock::get()?.unix_timestamp,
        });
        Ok(())
    }

    /// Admin: update the platform fee in basis points (max 1000 = 10%).
    pub fn update_fee(
        ctx: Context<AdminInstruction>,
        new_fee_basis_points: u16,
    ) -> Result<()> {
        require!(new_fee_basis_points <= 1000, EscrowError::FeeTooHigh);
        ctx.accounts.marketplace.fee_basis_points = new_fee_basis_points;
        Ok(())
    }

    /// Admin: emergency pause/unpause — no new ads or fulfillments allowed while paused.
    pub fn set_paused(ctx: Context<AdminInstruction>, paused: bool) -> Result<()> {
        ctx.accounts.marketplace.paused = paused;
        Ok(())
    }

    /// Seller creates a SELL ad. NUX tokens are atomically locked in an
    /// escrow vault PDA — no third party can move them.
    ///
    /// Security:
    /// - NUX tokens are transferred to a PDA vault derived from (creator, ad_id).
    /// - The vault's authority is the vault PDA itself (self-signing pattern).
    /// - Only cancel_ad or fulfill_sell_ad can move tokens out.
    pub fn create_sell_ad(
        ctx: Context<CreateSellAd>,
        ad_id: u64,
        nux_amount: u64,
        price_lamports_per_nux: u64,
        description: String,
    ) -> Result<()> {
        require!(!ctx.accounts.marketplace.paused, EscrowError::Paused);
        require!(
            nux_amount >= ctx.accounts.marketplace.min_ad_amount,
            EscrowError::AmountTooSmall
        );
        require!(price_lamports_per_nux > 0, EscrowError::InvalidPrice);
        require!(description.len() <= 200, EscrowError::DescriptionTooLong);

        // ── Transfer NUX from seller's ATA → escrow vault PDA ──────────────
        token::transfer(
            CpiContext::new(
                ctx.accounts.token_program.to_account_info(),
                Transfer {
                    from: ctx.accounts.seller_nux_account.to_account_info(),
                    to: ctx.accounts.escrow_vault.to_account_info(),
                    authority: ctx.accounts.seller.to_account_info(),
                },
            ),
            nux_amount,
        )?;

        // ── Initialize Ad account ──────────────────────────────────────────
        let ad = &mut ctx.accounts.ad;
        ad.ad_id = ad_id;
        ad.creator = ctx.accounts.seller.key();
        ad.ad_type = AdType::Sell;
        ad.nux_amount = nux_amount;
        ad.price_lamports_per_nux = price_lamports_per_nux;
        ad.description = description;
        ad.status = AdStatus::Active;
        ad.created_at = Clock::get()?.unix_timestamp;
        ad.fulfilled_at = 0;
        ad.counterparty = Pubkey::default();
        ad.bump = ctx.bumps.ad;
        ad.vault_bump = ctx.bumps.escrow_vault;

        ctx.accounts.marketplace.total_ads =
            ctx.accounts.marketplace.total_ads.saturating_add(1);

        emit!(AdCreated {
            ad_id,
            creator: ad.creator,
            ad_type: 0, // 0 = Sell
            nux_amount,
            price_lamports_per_nux,
        });
        Ok(())
    }

    /// Creator cancels their active ad — escrowed NUX is returned atomically.
    /// Only the original creator can cancel.
    pub fn cancel_ad(ctx: Context<CancelAd>) -> Result<()> {
        // Read needed values before any mutation (borrow checker safety)
        let creator_key = ctx.accounts.ad.creator;
        let ad_id = ctx.accounts.ad.ad_id;
        let vault_bump = ctx.accounts.ad.vault_bump;
        let nux_amount = ctx.accounts.ad.nux_amount;

        require!(ctx.accounts.ad.status == AdStatus::Active, EscrowError::AdNotActive);

        // ── Return NUX to creator's ATA (vault signs via PDA seeds) ────────
        let ad_id_bytes = ad_id.to_le_bytes();
        let vault_signer_seeds: &[&[&[u8]]] = &[&[
            b"vault",
            creator_key.as_ref(),
            ad_id_bytes.as_ref(),
            &[vault_bump],
        ]];

        token::transfer(
            CpiContext::new_with_signer(
                ctx.accounts.token_program.to_account_info(),
                Transfer {
                    from: ctx.accounts.escrow_vault.to_account_info(),
                    to: ctx.accounts.creator_nux_account.to_account_info(),
                    authority: ctx.accounts.escrow_vault.to_account_info(),
                },
                vault_signer_seeds,
            ),
            nux_amount,
        )?;

        // ── Mark cancelled ─────────────────────────────────────────────────
        ctx.accounts.ad.status = AdStatus::Cancelled;

        emit!(AdCancelled { ad_id, creator: creator_key });
        Ok(())
    }

    /// Buyer fulfills a SELL ad. Fully atomic:
    ///   SOL (minus fee) → seller
    ///   SOL fee         → admin
    ///   NUX tokens      → buyer
    ///
    /// Security:
    /// - Re-entrancy: impossible in Solana (no callbacks, synchronous CPI)
    /// - Self-trade: blocked by CannotSelfTrade check
    /// - Price manipulation: price is locked in the Ad account at creation time
    /// - Overflow: all arithmetic uses checked operations
    /// - Paused: marketplace can be halted by admin
    pub fn fulfill_sell_ad(ctx: Context<FulfillSellAd>) -> Result<()> {
        require!(!ctx.accounts.marketplace.paused, EscrowError::Paused);
        require!(ctx.accounts.ad.status == AdStatus::Active, EscrowError::AdNotActive);
        require!(ctx.accounts.ad.ad_type == AdType::Sell, EscrowError::WrongAdType);
        require!(
            ctx.accounts.ad.creator != ctx.accounts.buyer.key(),
            EscrowError::CannotSelfTrade
        );

        // Read all values before any state mutation
        let creator_key = ctx.accounts.ad.creator;
        let ad_id = ctx.accounts.ad.ad_id;
        let vault_bump = ctx.accounts.ad.vault_bump;
        let nux_amount = ctx.accounts.ad.nux_amount;
        let price_lamports_per_nux = ctx.accounts.ad.price_lamports_per_nux;
        let fee_basis_points = ctx.accounts.marketplace.fee_basis_points;
        let buyer_key = ctx.accounts.buyer.key();

        // ── Compute payment breakdown ──────────────────────────────────────
        let total_lamports = nux_amount
            .checked_mul(price_lamports_per_nux)
            .ok_or(EscrowError::Overflow)?;
        let fee = total_lamports
            .checked_mul(fee_basis_points as u64)
            .ok_or(EscrowError::Overflow)?
            .checked_div(10_000)
            .ok_or(EscrowError::Overflow)?;
        let seller_amount = total_lamports
            .checked_sub(fee)
            .ok_or(EscrowError::Overflow)?;

        // ── SOL: buyer → seller ────────────────────────────────────────────
        system_program::transfer(
            CpiContext::new(
                ctx.accounts.system_program.to_account_info(),
                system_program::Transfer {
                    from: ctx.accounts.buyer.to_account_info(),
                    to: ctx.accounts.seller.to_account_info(),
                },
            ),
            seller_amount,
        )?;

        // ── SOL: buyer → admin (platform fee) ─────────────────────────────
        if fee > 0 {
            system_program::transfer(
                CpiContext::new(
                    ctx.accounts.system_program.to_account_info(),
                    system_program::Transfer {
                        from: ctx.accounts.buyer.to_account_info(),
                        to: ctx.accounts.admin.to_account_info(),
                    },
                ),
                fee,
            )?;
        }

        // ── NUX: escrow vault → buyer's ATA (vault signs via PDA seeds) ───
        let ad_id_bytes = ad_id.to_le_bytes();
        let vault_signer_seeds: &[&[&[u8]]] = &[&[
            b"vault",
            creator_key.as_ref(),
            ad_id_bytes.as_ref(),
            &[vault_bump],
        ]];

        token::transfer(
            CpiContext::new_with_signer(
                ctx.accounts.token_program.to_account_info(),
                Transfer {
                    from: ctx.accounts.escrow_vault.to_account_info(),
                    to: ctx.accounts.buyer_nux_account.to_account_info(),
                    authority: ctx.accounts.escrow_vault.to_account_info(),
                },
                vault_signer_seeds,
            ),
            nux_amount,
        )?;

        // ── Update state (after all CPIs — checks-effects-interactions) ────
        ctx.accounts.ad.status = AdStatus::Fulfilled;
        ctx.accounts.ad.fulfilled_at = Clock::get()?.unix_timestamp;
        ctx.accounts.ad.counterparty = buyer_key;
        ctx.accounts.marketplace.total_volume_nux = ctx
            .accounts
            .marketplace
            .total_volume_nux
            .saturating_add(nux_amount);

        emit!(AdFulfilled {
            ad_id,
            seller: creator_key,
            buyer: buyer_key,
            nux_amount,
            total_lamports,
            fee,
        });
        Ok(())
    }
}

// ─────────────────────────────────────────────────────────────────────────────
//  ACCOUNT CONTEXTS
// ─────────────────────────────────────────────────────────────────────────────

#[derive(Accounts)]
pub struct InitializeMarketplace<'info> {
    #[account(
        init,
        payer = admin,
        space = 8 + Marketplace::INIT_SPACE,
        seeds = [b"marketplace"],
        bump
    )]
    pub marketplace: Account<'info, Marketplace>,
    pub nux_mint: Account<'info, Mint>,
    #[account(mut)]
    pub admin: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct AdminInstruction<'info> {
    #[account(
        mut,
        seeds = [b"marketplace"],
        bump = marketplace.bump,
        has_one = admin @ EscrowError::Unauthorized,
    )]
    pub marketplace: Account<'info, Marketplace>,
    pub admin: Signer<'info>,
}

#[derive(Accounts)]
#[instruction(ad_id: u64)]
pub struct CreateSellAd<'info> {
    #[account(
        mut,
        seeds = [b"marketplace"],
        bump = marketplace.bump,
    )]
    pub marketplace: Account<'info, Marketplace>,

    #[account(
        init,
        payer = seller,
        space = 8 + Ad::INIT_SPACE,
        seeds = [b"ad", seller.key().as_ref(), &ad_id.to_le_bytes()],
        bump
    )]
    pub ad: Account<'info, Ad>,

    /// Token account PDA that holds NUX in escrow.
    /// Its own PDA address is also its authority (self-referential PDA pattern).
    #[account(
        init,
        payer = seller,
        token::mint = nux_mint,
        token::authority = escrow_vault,
        seeds = [b"vault", seller.key().as_ref(), &ad_id.to_le_bytes()],
        bump
    )]
    pub escrow_vault: Account<'info, TokenAccount>,

    #[account(
        mut,
        associated_token::mint = nux_mint,
        associated_token::authority = seller,
    )]
    pub seller_nux_account: Account<'info, TokenAccount>,

    pub nux_mint: Account<'info, Mint>,
    #[account(mut)]
    pub seller: Signer<'info>,
    pub token_program: Program<'info, Token>,
    pub associated_token_program: Program<'info, AssociatedToken>,
    pub system_program: Program<'info, System>,
    pub rent: Sysvar<'info, Rent>,
}

#[derive(Accounts)]
pub struct CancelAd<'info> {
    #[account(
        mut,
        seeds = [b"ad", creator.key().as_ref(), &ad.ad_id.to_le_bytes()],
        bump = ad.bump,
        has_one = creator @ EscrowError::Unauthorized,
    )]
    pub ad: Account<'info, Ad>,

    #[account(
        mut,
        seeds = [b"vault", creator.key().as_ref(), &ad.ad_id.to_le_bytes()],
        bump = ad.vault_bump,
        token::mint = nux_mint,
        token::authority = escrow_vault,
    )]
    pub escrow_vault: Account<'info, TokenAccount>,

    #[account(
        mut,
        associated_token::mint = nux_mint,
        associated_token::authority = creator,
    )]
    pub creator_nux_account: Account<'info, TokenAccount>,

    pub nux_mint: Account<'info, Mint>,
    pub creator: Signer<'info>,
    pub token_program: Program<'info, Token>,
    pub associated_token_program: Program<'info, AssociatedToken>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct FulfillSellAd<'info> {
    #[account(
        mut,
        seeds = [b"marketplace"],
        bump = marketplace.bump,
    )]
    pub marketplace: Account<'info, Marketplace>,

    #[account(
        mut,
        seeds = [b"ad", ad.creator.as_ref(), &ad.ad_id.to_le_bytes()],
        bump = ad.bump,
    )]
    pub ad: Account<'info, Ad>,

    #[account(
        mut,
        seeds = [b"vault", ad.creator.as_ref(), &ad.ad_id.to_le_bytes()],
        bump = ad.vault_bump,
        token::mint = nux_mint,
        token::authority = escrow_vault,
    )]
    pub escrow_vault: Account<'info, TokenAccount>,

    #[account(
        init_if_needed,
        payer = buyer,
        associated_token::mint = nux_mint,
        associated_token::authority = buyer,
    )]
    pub buyer_nux_account: Account<'info, TokenAccount>,

    pub nux_mint: Account<'info, Mint>,

    /// CHECK: admin receives platform fee; constraint validated via marketplace.admin
    #[account(
        mut,
        address = marketplace.admin @ EscrowError::Unauthorized,
    )]
    pub admin: AccountInfo<'info>,

    /// CHECK: seller receives SOL; pubkey validated via ad.creator stored on-chain
    #[account(
        mut,
        address = ad.creator @ EscrowError::SellerMismatch,
    )]
    pub seller: AccountInfo<'info>,

    #[account(mut)]
    pub buyer: Signer<'info>,

    pub token_program: Program<'info, Token>,
    pub associated_token_program: Program<'info, AssociatedToken>,
    pub system_program: Program<'info, System>,
}

// ─────────────────────────────────────────────────────────────────────────────
//  STATE ACCOUNTS
// ─────────────────────────────────────────────────────────────────────────────

#[account]
#[derive(InitSpace)]
pub struct Marketplace {
    pub admin: Pubkey,                      // 32 — owner with update authority
    pub nux_mint: Pubkey,                   // 32 — NUX SPL token mint address
    pub fee_basis_points: u16,              //  2 — platform fee (200 = 2%)
    pub reference_price_lamports: u64,      //  8 — guide price set by admin
    pub min_ad_amount: u64,                 //  8 — minimum NUX per ad (raw units)
    pub total_ads: u64,                     //  8 — lifetime ad counter
    pub total_volume_nux: u64,              //  8 — total NUX volume traded
    pub paused: bool,                       //  1 — emergency pause flag
    pub bump: u8,                           //  1 — PDA bump seed
}

#[account]
#[derive(InitSpace)]
pub struct Ad {
    pub ad_id: u64,                         //  8 — unique ID (set by creator)
    pub creator: Pubkey,                    // 32 — wallet that created the ad
    pub ad_type: AdType,                    //  1 — Sell | Buy
    pub nux_amount: u64,                    //  8 — raw NUX units being traded
    pub price_lamports_per_nux: u64,        //  8 — SOL lamports per 1 raw NUX
    #[max_len(200)]
    pub description: String,               //  4 + 200 — seller notes
    pub status: AdStatus,                   //  1 — Active | Fulfilled | Cancelled
    pub created_at: i64,                    //  8 — unix ts
    pub fulfilled_at: i64,                  //  8 — unix ts (0 if not fulfilled)
    pub counterparty: Pubkey,               // 32 — buyer (set on fulfill)
    pub bump: u8,                           //  1 — PDA bump
    pub vault_bump: u8,                     //  1 — vault PDA bump
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, PartialEq, InitSpace)]
pub enum AdType {
    Sell,
    Buy, // Reserved for v2
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, PartialEq, InitSpace)]
pub enum AdStatus {
    Active,
    Fulfilled,
    Cancelled,
}

// ─────────────────────────────────────────────────────────────────────────────
//  EVENTS
// ─────────────────────────────────────────────────────────────────────────────

#[event]
pub struct MarketplaceInitialized {
    pub admin: Pubkey,
    pub fee_basis_points: u16,
    pub reference_price_lamports: u64,
}

#[event]
pub struct PriceUpdated {
    pub new_price_lamports: u64,
    pub timestamp: i64,
}

#[event]
pub struct AdCreated {
    pub ad_id: u64,
    pub creator: Pubkey,
    pub ad_type: u8,
    pub nux_amount: u64,
    pub price_lamports_per_nux: u64,
}

#[event]
pub struct AdCancelled {
    pub ad_id: u64,
    pub creator: Pubkey,
}

#[event]
pub struct AdFulfilled {
    pub ad_id: u64,
    pub seller: Pubkey,
    pub buyer: Pubkey,
    pub nux_amount: u64,
    pub total_lamports: u64,
    pub fee: u64,
}

// ─────────────────────────────────────────────────────────────────────────────
//  ERRORS
// ─────────────────────────────────────────────────────────────────────────────

#[error_code]
pub enum EscrowError {
    #[msg("Fee basis points cannot exceed 1000 (10%)")]
    FeeTooHigh,
    #[msg("Price must be greater than zero")]
    InvalidPrice,
    #[msg("Amount must be greater than zero")]
    InvalidAmount,
    #[msg("Amount is below the marketplace minimum")]
    AmountTooSmall,
    #[msg("Description cannot exceed 200 characters")]
    DescriptionTooLong,
    #[msg("Ad is not active")]
    AdNotActive,
    #[msg("Wrong ad type for this operation")]
    WrongAdType,
    #[msg("Cannot fulfill your own ad")]
    CannotSelfTrade,
    #[msg("Arithmetic overflow in price calculation")]
    Overflow,
    #[msg("Unauthorized: signer is not the admin or ad creator")]
    Unauthorized,
    #[msg("Provided seller address does not match the ad creator")]
    SellerMismatch,
    #[msg("Marketplace is currently paused")]
    Paused,
}
