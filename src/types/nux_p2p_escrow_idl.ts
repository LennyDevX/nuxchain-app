/**
 * IDL for the NuxP2PEscrow Anchor program (v0.1.0)
 *
 * Generated manually from programs/nux-p2p-escrow/src/lib.rs
 * After `anchor build`, replace this with the auto-generated IDL from
 * target/idl/nux_p2p_escrow.json (they should be equivalent).
 *
 * Discriminators calculated as sha256("global:<snake_name>")[0:8]
 * and sha256("account:<CamelName>")[0:8]
 */
export type NuxP2pEscrow = {
  address: string
  metadata: {
    name: 'nux_p2p_escrow'
    version: '0.1.0'
    spec: '0.1.0'
  }
  instructions: [
    {
      name: 'initializeMarketplace'
      discriminator: [47, 81, 64, 0, 96, 56, 105, 7]
      accounts: [
        { name: 'marketplace'; writable: true; pda: { seeds: [{ kind: 'const'; value: [109, 97, 114, 107, 101, 116, 112, 108, 97, 99, 101] }] } },
        { name: 'nuxMint' },
        { name: 'admin'; writable: true; signer: true },
        { name: 'systemProgram'; address: '11111111111111111111111111111111' },
      ]
      args: [
        { name: 'feeBasisPoints'; type: 'u16' },
        { name: 'referencePriceLamports'; type: 'u64' },
        { name: 'minAdAmount'; type: 'u64' },
      ]
    },
    {
      name: 'updateReferencePrice'
      discriminator: [217, 163, 53, 16, 48, 178, 32, 125]
      accounts: [
        { name: 'marketplace'; writable: true; pda: { seeds: [{ kind: 'const'; value: [109, 97, 114, 107, 101, 116, 112, 108, 97, 99, 101] }] } },
        { name: 'admin'; signer: true },
      ]
      args: [{ name: 'newPriceLamports'; type: 'u64' }]
    },
    {
      name: 'updateFee'
      discriminator: [232, 253, 195, 247, 148, 212, 73, 222]
      accounts: [
        { name: 'marketplace'; writable: true; pda: { seeds: [{ kind: 'const'; value: [109, 97, 114, 107, 101, 116, 112, 108, 97, 99, 101] }] } },
        { name: 'admin'; signer: true },
      ]
      args: [{ name: 'newFeeBasisPoints'; type: 'u16' }]
    },
    {
      name: 'setPaused'
      discriminator: [91, 60, 125, 192, 176, 225, 166, 218]
      accounts: [
        { name: 'marketplace'; writable: true; pda: { seeds: [{ kind: 'const'; value: [109, 97, 114, 107, 101, 116, 112, 108, 97, 99, 101] }] } },
        { name: 'admin'; signer: true },
      ]
      args: [{ name: 'paused'; type: 'bool' }]
    },
    {
      name: 'createSellAd'
      discriminator: [131, 158, 207, 124, 171, 96, 150, 212]
      accounts: [
        { name: 'marketplace'; writable: true; pda: { seeds: [{ kind: 'const'; value: [109, 97, 114, 107, 101, 116, 112, 108, 97, 99, 101] }] } },
        { name: 'ad'; writable: true; pda: { seeds: [{ kind: 'const'; value: [97, 100] }, { kind: 'account'; path: 'seller' }, { kind: 'arg'; path: 'adId' }] } },
        { name: 'escrowVault'; writable: true; pda: { seeds: [{ kind: 'const'; value: [118, 97, 117, 108, 116] }, { kind: 'account'; path: 'seller' }, { kind: 'arg'; path: 'adId' }] } },
        { name: 'sellerNuxAccount'; writable: true },
        { name: 'nuxMint' },
        { name: 'seller'; writable: true; signer: true },
        { name: 'tokenProgram'; address: 'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA' },
        { name: 'associatedTokenProgram'; address: 'ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJe1bA1' },
        { name: 'systemProgram'; address: '11111111111111111111111111111111' },
        { name: 'rent'; address: 'SysvarRent111111111111111111111111111111111' },
      ]
      args: [
        { name: 'adId'; type: 'u64' },
        { name: 'nuxAmount'; type: 'u64' },
        { name: 'priceLamportsPerNux'; type: 'u64' },
        { name: 'description'; type: 'string' },
      ]
    },
    {
      name: 'cancelAd'
      discriminator: [177, 216, 171, 147, 132, 85, 63, 1]
      accounts: [
        { name: 'ad'; writable: true; pda: { seeds: [{ kind: 'const'; value: [97, 100] }, { kind: 'account'; path: 'creator' }, { kind: 'account'; path: 'ad.adId' }] } },
        { name: 'escrowVault'; writable: true; pda: { seeds: [{ kind: 'const'; value: [118, 97, 117, 108, 116] }, { kind: 'account'; path: 'creator' }, { kind: 'account'; path: 'ad.adId' }] } },
        { name: 'creatorNuxAccount'; writable: true },
        { name: 'nuxMint' },
        { name: 'creator'; signer: true },
        { name: 'tokenProgram'; address: 'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA' },
        { name: 'associatedTokenProgram'; address: 'ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJe1bA1' },
        { name: 'systemProgram'; address: '11111111111111111111111111111111' },
      ]
      args: []
    },
    {
      name: 'fulfillSellAd'
      discriminator: [250, 177, 105, 31, 220, 214, 40, 185]
      accounts: [
        { name: 'marketplace'; writable: true; pda: { seeds: [{ kind: 'const'; value: [109, 97, 114, 107, 101, 116, 112, 108, 97, 99, 101] }] } },
        { name: 'ad'; writable: true },
        { name: 'escrowVault'; writable: true },
        { name: 'buyerNuxAccount'; writable: true },
        { name: 'nuxMint' },
        { name: 'admin'; writable: true },
        { name: 'seller'; writable: true },
        { name: 'buyer'; writable: true; signer: true },
        { name: 'tokenProgram'; address: 'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA' },
        { name: 'associatedTokenProgram'; address: 'ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJe1bA1' },
        { name: 'systemProgram'; address: '11111111111111111111111111111111' },
      ]
      args: []
    },
  ]
  accounts: [
    {
      name: 'Marketplace'
      discriminator: [70, 222, 41, 62, 78, 3, 32, 174]
    },
    {
      name: 'Ad'
      discriminator: [81, 91, 73, 106, 215, 137, 214, 47]
    },
  ]
  events: [
    {
      name: 'MarketplaceInitialized'
      discriminator: [0, 0, 0, 0, 0, 0, 0, 0]
    },
    {
      name: 'AdFulfilled'
      discriminator: [0, 0, 0, 0, 0, 0, 0, 0]
    },
  ]
  errors: [
    { code: 6000; name: 'FeeTooHigh'; msg: 'Fee basis points cannot exceed 1000 (10%)' },
    { code: 6001; name: 'InvalidPrice'; msg: 'Price must be greater than zero' },
    { code: 6002; name: 'InvalidAmount'; msg: 'Amount must be greater than zero' },
    { code: 6003; name: 'AmountTooSmall'; msg: 'Amount is below the marketplace minimum' },
    { code: 6004; name: 'DescriptionTooLong'; msg: 'Description cannot exceed 200 characters' },
    { code: 6005; name: 'AdNotActive'; msg: 'Ad is not active' },
    { code: 6006; name: 'WrongAdType'; msg: 'Wrong ad type for this operation' },
    { code: 6007; name: 'CannotSelfTrade'; msg: 'Cannot fulfill your own ad' },
    { code: 6008; name: 'Overflow'; msg: 'Arithmetic overflow in price calculation' },
    { code: 6009; name: 'Unauthorized'; msg: 'Unauthorized: signer is not the admin or ad creator' },
    { code: 6010; name: 'SellerMismatch'; msg: 'Provided seller address does not match the ad creator' },
    { code: 6011; name: 'Paused'; msg: 'Marketplace is currently paused' },
  ]
  types: [
    {
      name: 'Marketplace'
      type: {
        kind: 'struct'
        fields: [
          { name: 'admin'; type: 'publicKey' },
          { name: 'nuxMint'; type: 'publicKey' },
          { name: 'feeBasisPoints'; type: 'u16' },
          { name: 'referencePriceLamports'; type: 'u64' },
          { name: 'minAdAmount'; type: 'u64' },
          { name: 'totalAds'; type: 'u64' },
          { name: 'totalVolumeNux'; type: 'u64' },
          { name: 'paused'; type: 'bool' },
          { name: 'bump'; type: 'u8' },
        ]
      }
    },
    {
      name: 'Ad'
      type: {
        kind: 'struct'
        fields: [
          { name: 'adId'; type: 'u64' },
          { name: 'creator'; type: 'publicKey' },
          { name: 'adType'; type: { defined: { name: 'AdType' } } },
          { name: 'nuxAmount'; type: 'u64' },
          { name: 'priceLamportsPerNux'; type: 'u64' },
          { name: 'description'; type: 'string' },
          { name: 'status'; type: { defined: { name: 'AdStatus' } } },
          { name: 'createdAt'; type: 'i64' },
          { name: 'fulfilledAt'; type: 'i64' },
          { name: 'counterparty'; type: 'publicKey' },
          { name: 'bump'; type: 'u8' },
          { name: 'vaultBump'; type: 'u8' },
        ]
      }
    },
    {
      name: 'AdType'
      type: {
        kind: 'enum'
        variants: [{ name: 'Sell' }, { name: 'Buy' }]
      }
    },
    {
      name: 'AdStatus'
      type: {
        kind: 'enum'
        variants: [{ name: 'Active' }, { name: 'Fulfilled' }, { name: 'Cancelled' }]
      }
    },
  ]
}

export const IDL: NuxP2pEscrow = {
  address: 'Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFsLnS', // placeholder — updated after deploy
  metadata: {
    name: 'nux_p2p_escrow',
    version: '0.1.0',
    spec: '0.1.0',
  },
  instructions: [
    {
      name: 'initializeMarketplace',
      discriminator: [47, 81, 64, 0, 96, 56, 105, 7],
      accounts: [
        { name: 'marketplace', writable: true, pda: { seeds: [{ kind: 'const', value: [109, 97, 114, 107, 101, 116, 112, 108, 97, 99, 101] }] } },
        { name: 'nuxMint' },
        { name: 'admin', writable: true, signer: true },
        { name: 'systemProgram', address: '11111111111111111111111111111111' },
      ],
      args: [
        { name: 'feeBasisPoints', type: 'u16' },
        { name: 'referencePriceLamports', type: 'u64' },
        { name: 'minAdAmount', type: 'u64' },
      ],
    },
    {
      name: 'updateReferencePrice',
      discriminator: [217, 163, 53, 16, 48, 178, 32, 125],
      accounts: [
        { name: 'marketplace', writable: true, pda: { seeds: [{ kind: 'const', value: [109, 97, 114, 107, 101, 116, 112, 108, 97, 99, 101] }] } },
        { name: 'admin', signer: true },
      ],
      args: [{ name: 'newPriceLamports', type: 'u64' }],
    },
    {
      name: 'updateFee',
      discriminator: [232, 253, 195, 247, 148, 212, 73, 222],
      accounts: [
        { name: 'marketplace', writable: true, pda: { seeds: [{ kind: 'const', value: [109, 97, 114, 107, 101, 116, 112, 108, 97, 99, 101] }] } },
        { name: 'admin', signer: true },
      ],
      args: [{ name: 'newFeeBasisPoints', type: 'u16' }],
    },
    {
      name: 'setPaused',
      discriminator: [91, 60, 125, 192, 176, 225, 166, 218],
      accounts: [
        { name: 'marketplace', writable: true, pda: { seeds: [{ kind: 'const', value: [109, 97, 114, 107, 101, 116, 112, 108, 97, 99, 101] }] } },
        { name: 'admin', signer: true },
      ],
      args: [{ name: 'paused', type: 'bool' }],
    },
    {
      name: 'createSellAd',
      discriminator: [131, 158, 207, 124, 171, 96, 150, 212],
      accounts: [
        { name: 'marketplace', writable: true, pda: { seeds: [{ kind: 'const', value: [109, 97, 114, 107, 101, 116, 112, 108, 97, 99, 101] }] } },
        { name: 'ad', writable: true, pda: { seeds: [{ kind: 'const', value: [97, 100] }, { kind: 'account', path: 'seller' }, { kind: 'arg', path: 'adId' }] } },
        { name: 'escrowVault', writable: true, pda: { seeds: [{ kind: 'const', value: [118, 97, 117, 108, 116] }, { kind: 'account', path: 'seller' }, { kind: 'arg', path: 'adId' }] } },
        { name: 'sellerNuxAccount', writable: true },
        { name: 'nuxMint' },
        { name: 'seller', writable: true, signer: true },
        { name: 'tokenProgram', address: 'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA' },
        { name: 'associatedTokenProgram', address: 'ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJe1bA1' },
        { name: 'systemProgram', address: '11111111111111111111111111111111' },
        { name: 'rent', address: 'SysvarRent111111111111111111111111111111111' },
      ],
      args: [
        { name: 'adId', type: 'u64' },
        { name: 'nuxAmount', type: 'u64' },
        { name: 'priceLamportsPerNux', type: 'u64' },
        { name: 'description', type: 'string' },
      ],
    },
    {
      name: 'cancelAd',
      discriminator: [177, 216, 171, 147, 132, 85, 63, 1],
      accounts: [
        { name: 'ad', writable: true, pda: { seeds: [{ kind: 'const', value: [97, 100] }, { kind: 'account', path: 'creator' }, { kind: 'account', path: 'ad.adId' }] } },
        { name: 'escrowVault', writable: true, pda: { seeds: [{ kind: 'const', value: [118, 97, 117, 108, 116] }, { kind: 'account', path: 'creator' }, { kind: 'account', path: 'ad.adId' }] } },
        { name: 'creatorNuxAccount', writable: true },
        { name: 'nuxMint' },
        { name: 'creator', signer: true },
        { name: 'tokenProgram', address: 'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA' },
        { name: 'associatedTokenProgram', address: 'ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJe1bA1' },
        { name: 'systemProgram', address: '11111111111111111111111111111111' },
      ],
      args: [],
    },
    {
      name: 'fulfillSellAd',
      discriminator: [250, 177, 105, 31, 220, 214, 40, 185],
      accounts: [
        { name: 'marketplace', writable: true, pda: { seeds: [{ kind: 'const', value: [109, 97, 114, 107, 101, 116, 112, 108, 97, 99, 101] }] } },
        { name: 'ad', writable: true },
        { name: 'escrowVault', writable: true },
        { name: 'buyerNuxAccount', writable: true },
        { name: 'nuxMint' },
        { name: 'admin', writable: true },
        { name: 'seller', writable: true },
        { name: 'buyer', writable: true, signer: true },
        { name: 'tokenProgram', address: 'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA' },
        { name: 'associatedTokenProgram', address: 'ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJe1bA1' },
        { name: 'systemProgram', address: '11111111111111111111111111111111' },
      ],
      args: [],
    },
  ],
  accounts: [
    {
      name: 'Marketplace',
      discriminator: [70, 222, 41, 62, 78, 3, 32, 174],
    },
    {
      name: 'Ad',
      discriminator: [81, 91, 73, 106, 215, 137, 214, 47],
    },
  ],
  events: [
    {
      name: 'MarketplaceInitialized',
      discriminator: [0, 0, 0, 0, 0, 0, 0, 0],
    },
    {
      name: 'AdFulfilled',
      discriminator: [0, 0, 0, 0, 0, 0, 0, 0],
    },
  ],
  errors: [
    { code: 6000, name: 'FeeTooHigh', msg: 'Fee basis points cannot exceed 1000 (10%)' },
    { code: 6001, name: 'InvalidPrice', msg: 'Price must be greater than zero' },
    { code: 6002, name: 'InvalidAmount', msg: 'Amount must be greater than zero' },
    { code: 6003, name: 'AmountTooSmall', msg: 'Amount is below the marketplace minimum' },
    { code: 6004, name: 'DescriptionTooLong', msg: 'Description cannot exceed 200 characters' },
    { code: 6005, name: 'AdNotActive', msg: 'Ad is not active' },
    { code: 6006, name: 'WrongAdType', msg: 'Wrong ad type for this operation' },
    { code: 6007, name: 'CannotSelfTrade', msg: 'Cannot fulfill your own ad' },
    { code: 6008, name: 'Overflow', msg: 'Arithmetic overflow in price calculation' },
    { code: 6009, name: 'Unauthorized', msg: 'Unauthorized: signer is not the admin or ad creator' },
    { code: 6010, name: 'SellerMismatch', msg: 'Provided seller address does not match the ad creator' },
    { code: 6011, name: 'Paused', msg: 'Marketplace is currently paused' },
  ],
  types: [
    {
      name: 'Marketplace',
      type: {
        kind: 'struct',
        fields: [
          { name: 'admin', type: 'publicKey' },
          { name: 'nuxMint', type: 'publicKey' },
          { name: 'feeBasisPoints', type: 'u16' },
          { name: 'referencePriceLamports', type: 'u64' },
          { name: 'minAdAmount', type: 'u64' },
          { name: 'totalAds', type: 'u64' },
          { name: 'totalVolumeNux', type: 'u64' },
          { name: 'paused', type: 'bool' },
          { name: 'bump', type: 'u8' },
        ],
      },
    },
    {
      name: 'Ad',
      type: {
        kind: 'struct',
        fields: [
          { name: 'adId', type: 'u64' },
          { name: 'creator', type: 'publicKey' },
          { name: 'adType', type: { defined: { name: 'AdType' } } },
          { name: 'nuxAmount', type: 'u64' },
          { name: 'priceLamportsPerNux', type: 'u64' },
          { name: 'description', type: 'string' },
          { name: 'status', type: { defined: { name: 'AdStatus' } } },
          { name: 'createdAt', type: 'i64' },
          { name: 'fulfilledAt', type: 'i64' },
          { name: 'counterparty', type: 'publicKey' },
          { name: 'bump', type: 'u8' },
          { name: 'vaultBump', type: 'u8' },
        ],
      },
    },
    {
      name: 'AdType',
      type: {
        kind: 'enum',
        variants: [{ name: 'Sell' }, { name: 'Buy' }],
      },
    },
    {
      name: 'AdStatus',
      type: {
        kind: 'enum',
        variants: [{ name: 'Active' }, { name: 'Fulfilled' }, { name: 'Cancelled' }],
      },
    },
  ],
} as unknown as NuxP2pEscrow
