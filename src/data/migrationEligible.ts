/**
 * Eligible Solana wallets for the Polygon migration program.
 * Source: airdrop-analysis-hybrid-2026-03-21.csv (exists: Yes)
 * These users registered on Solana and are now migrating to Polygon
 * to receive a future POL token airdrop.
 */
export const ELIGIBLE_SOLANA_WALLETS = new Set<string>([
  '2hP3FnydiXRM4vGnVhCJRbk9CjVqgTVYe5vGhBXUnn3C',
  'kA6vxcHAUH6a5dzBJU3kr7YpDag5zEKp5Jag8ejrAJx',
  '3V67cwS2n2egdyaUqTCmt4G2riLXV49T4LipK5sx76Bj',
  '8gVrimMB7paWhoYSQJBTXu8LS3Xwd3uX3pxQhKX2o6GW',
  'J8wLTWGNtXP7yYv22AeGknLFixVLSYhD16N5AoM4qCpY',
  '7zsc38jogNmm3Gv2Xb1iBVhabN45nBtUZdsEsJ7GVqJH',
  'Bx7GMstDrTKCRQBcArym3YvVzy2TJLLkr2nrRpbgJZ1R',
  'DfiGT6TsDScD9eF8SxKtFpg4qxv4WPYUMo7WBVqsFGG2',
  'CcDAQp41wCmBcLp2q4Ztjmi8RgRH8m1VH54SHXPeUaNa',
  '9RVsnxhbrfWCFHFXnQT7EuVPYYPKhAw8UAPUFG8PgV3W',
  '4JbaX3ELBYXgzMdXwhpH7g3bSaiFEqux2aPpDykeer1B',
  'FoM6nLNDmstjbF9QYjF44in8KoVRFmgrrdBCCWHw9qXs',
  'HQxmqqn26rdxhcbmnzcwTJfMidKXq3V8Ynmpkj9skF7E',
  '9mi47hV51tU27nugPk7qiK6sAMSzgrxS1oSS2PchUJK3',
  '4qKsjwacTA1YyxXXA1ggZ31noKrV7qzCGTvwhyYSiUNK',
  '9QehZA24xrjGvS796EoLxJXAJ94rrJMyM6fj5Z2wKd3g',
  'ExKK1PUjrPWXg99wg37JTyKkgg5JAZt7PXeJo4qLfY9g',
  'FzDZTB2Yn93WKDX4euDYgmFXKBP2thuF8JyhLbfNKMSP',
  'FDAxHYGtFgzrhHLZpN42QmicXjzkwvj7UN8ASNAXbSkE',
  'DVmo4LhHRN8duPFaMfAPkc4R6VRNqShdLRGymPzwWBdm',
  'C2WLDSymouVcqQHJohzmPEJP6TKoRNZjryBSiEjJvLPQ',
  '9kAWqUFYaUH87hJp6oTMWgRjNGCChhLgq7dXZJagUKS6',
  '8jHUMy9Vs8iAdDSZMvWhx7G1jCMUW5rUJ7tG4WUGXEaV',
  '3jXr33D6eFy7zuSw7UU3C6TFBfGcKACgxaPu472SdxKQ',
  'Azf3QZ2rbegjygmDC6dxSxvYCBcUKbHzYAreZ66ePymg',
  '2AU9G23jdck1XEktPQHUJC2EpgJQqRtqC1XnTFCnTpMm',
  'BD2ccGGmNPLwo9KkZ8SFB4JSKh2TnTKo9t9cQC15J3CU',
  '3fbQj4JVmWPkLCaA2Vy6efkHdLLENFxt33fvJHJNipiR',
  '3qATGNiQtGnLrHN9WqqVTDopBXD1zmy1RQEGLW3MDpkq',
  'GpH5RJC8JaVQ8YS7gBQ7PbwPiGPwVWMZ2yr37AE99fhp',
  '6b3zsNkPjbjrJtoam1diMVZqYLsrwc4JYFAZLkqad8hr',
  'HUQCdTGFXzCRtCHveA746ETvhvZizDuCxQueRefMNeKi',
  '8jePjSzbLXX4p39RCGf1DT8MwyySCk9vtC4hzeXmfcun',
  'Evk7HWXgmRc544xvkJZGt4p94VgX1583hyng7JfnJ4L6',
  'G68VGrubQh2N1X18fGfZckMo3M6fv4E5oPGxLdRDDzLC',
  '355AVGNBwdcFCgVXFQdmH8JVg9fAJovX9W211haHGgeC',
  '9rcnkp6tNW1fUJmxjSH4jNhNzknEFEja4Y9Ee3wkjp7T',
  '6Kj8M9Tbu678zFpyMoNkvT8F65wsNz9xnMrRnuvLAaGa',
  '7Pm3ntyCyyg3aF1tVoeMEdRJN1Q8TNbdoJ62SMZy94to',
  '4YaQrQzmb1ZMZn3wHkT23pPNSE3z832865aZSFcUJDWd',
  'AmgzhTJCEktjauAAmtpNbrqjUZpkGi3nsacwvSwGZMxG',
  'EUFGjuMoC9WA9fzt4jfkSD7LTuEHW8Tmb2Rhy8NoTNbd',
  'DLkQH6i3dtxm7bLYUuwTAfKnnX8uAsh3GRdHMqWMXzMr',
  'ESccNF84ZUdFQWJgRSow1E176PU5F9SHYwJYEZfRyjP',
  '87TX3bE6oyAJHcJaqa8e4M6v4GXwTUbcZF2ad9eVzkp',
  '5oJaRiRVjg4EW5x6LPNLWvh1jh3iFraufpmnavnt11qi',
  '7KborXSz3QEy6c34mC7pczDckUyZ8yeE6yJ2LP4EZ9UB',
  'DySWk3BtaAutHve1YiwvyZX3R98ryLMsC5XzJuFrWqny',
  'FfZZQA957t6uLfa1zhTYuFF4Myg6ck8wb93kK6Aok2JZ',
  '85bUbfpZRMTupTTZayQurjirFGpkp5d4nU4K8WmMT16b',
  '8ehqJoi4hdTd5ct185FNAVyz8JfiRdWB5Q5S3H8Ph1kM',
  '44cWSLqUqG54DCY8oQewQgmW8iLpSYnhF8fxXCcWhVhu',
  '5ehW8cLQbctvDetDUtjpZEiXsvB5G63gTYtNVAUdxKri',
  'E9s6k8V37AaeoBK2m7xGUBEVLMWrv3ttXvusb7prRCDT',
  '7DJtbpWYaYoNseBuEiRcsGbZ7b81x4gEfg9gLZaZcEBb',
  '679SY7nw9dNSB1tcvfkmtbqwQqLuBHv7ybfmhSxuo1hS',
  '5XJv2B1s8kZDcTqieb4LtZXLCq2rA4yJn9sWoBhC7mPJ',
  'EwiMMjKaHySB6pYkcfY391DW9BZAsRzcr5crxne7kzff',
  'CbNoW6eQKsbxpVvQcRD2yvSxQ8xiCdHpumQNHqVJJ5Av',
  'QaRb2Gx5YEWLGgycpR4zC32jPoZewc3diuoB5CdrBYJ',
  '2EYV2HkoJoGoDbEaVT43Ug8ySLCuB2CpgJ18GZsgZyJJ',
  'FTxGyz5smZgQZH4ssvgVVbuGruY4hetNumsVAwneJdiA',
  '8wYsip2F29mhEz9QWpmv1FgSWgqfc2fTNQfXJ2yW7JnW',
  '49VEFFtcXRKSrX9xDtiF8riPVRxdmmjeDt7j1iJMamxy',
  'FyvqB7brUwfWUzMjTNU1CFwqr8BzwvRJCm217KMj8pJY',
]);

/** Returns true if the given Solana address is in the eligible set. */
export function isEligibleSolanaWallet(address: string): boolean {
  return ELIGIBLE_SOLANA_WALLETS.has(address.trim());
}

/** Basic Solana address format check (base58, 32-44 chars). */
export function isValidSolanaAddress(address: string): boolean {
  return /^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(address.trim());
}
