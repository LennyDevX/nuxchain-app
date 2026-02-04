import { motion } from 'framer-motion'

function CollaboratorsSection() {

  const roles = [
    {
      title: 'Community Moderator',
      emoji: '🛡️',
      rewards: [
        'Monthly POL tokens',
        'Exclusive staff NFTs',
        'Access to private channels',
        'Verified badge on profile'
      ],
      requirements: ['Gold level or higher', 'Moderation experience', '10h/week availability'],
      color: 'from-blue-500 to-cyan-500'
    },
    {
      title: 'Brand Ambassador',
      emoji: '📣',
      rewards: [
        '2% revenue share',
        'Referral commissions',
        'Swag and merchandise',
        'Early access to features'
      ],
      requirements: ['Social media presence', 'Create regular content', 'Passion for Web3'],
      color: 'from-purple-500 to-pink-500'
    },
    {
      title: 'Technical Validator',
      emoji: '⚙️',
      rewards: [
        'Validation rewards',
        'Governance participation',
        'Infrastructure access',
        'Priority technical support'
      ],
      requirements: ['Technical knowledge', 'Own infrastructure', 'Minimum stake 5,000 POL'],
      color: 'from-red-500 to-orange-500'
    },
    {
      title: 'Content Creator',
      emoji: '🎬',
      rewards: [
        'Payment per article/video',
        'Featured on platform',
        'Official collaborations',
        'Engagement bonus'
      ],
      requirements: ['Content portfolio', 'Professional quality', 'Nuxchain knowledge'],
      color: 'from-green-500 to-emerald-500'
    }
  ]

  const benefits = [
    { icon: '💸', title: 'Regular Compensation', desc: 'POL payments every month' },
    { icon: '🎓', title: 'Continuous Training', desc: 'Access to courses and workshops' },
    { icon: '🤝', title: 'Networking', desc: 'Connection with core team' },
    { icon: '🚀', title: 'Growth', desc: 'Full-time opportunities' }
  ]

  return (
    <section className="w-full relative py-12 lg:py-24 overflow-hidden border-t border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/30 mb-6">
            <span className="text-xl">🤝</span>
            <span className="text-[10px] font-black uppercase tracking-widest text-purple-400">Join the Team</span>
          </div>

          <h2 className="text-4xl lg:text-6xl font-black text-white leading-tight mb-6">
            Help us Build <span className="text-gradient">Nuxchain</span>
          </h2>

          <p className="text-gray-400 text-lg max-w-2xl mx-auto leading-relaxed">
            Be part of the growth. We offer multiple roles with token compensation, exclusive benefits, and career opportunities in Web3.
          </p>
        </motion.div>

        {/* Roles Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
          {roles.map((role, index) => (
            <motion.div
              key={index}
              whileHover={{ scale: 1.02 }}
              className="bg-neutral-900 border border-white/10 rounded-3xl p-8 hover:border-purple-500/30 transition-all duration-500 shadow-2xl"
            >
              {/* Icon & Title */}
              <div className="flex items-center gap-5 mb-8">
                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${role.color} flex items-center justify-center text-3xl shadow-lg`}>
                  {role.emoji}
                </div>
                <h3 className="text-2xl font-black text-white tracking-tight">{role.title}</h3>
              </div>

              {/* Rewards */}
              <div className="mb-8">
                <p className="text-xs font-black text-purple-400 mb-4 uppercase tracking-[0.2em]">Rewards:</p>
                <ul className="grid grid-cols-1 gap-3">
                  {role.rewards.map((reward, idx) => (
                    <li key={idx} className="flex items-start gap-3 text-sm text-gray-400">
                      <span className="text-purple-500 text-lg">✦</span>
                      <span>{reward}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Requirements */}
              <div>
                <p className="text-xs font-black text-gray-500 mb-4 uppercase tracking-[0.2em]">Requirements:</p>
                <div className="flex flex-wrap gap-2">
                  {role.requirements.map((req, idx) => (
                    <span
                      key={idx}
                      className="px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg text-xs text-gray-300 font-medium"
                    >
                      {req}
                    </span>
                  ))}
                </div>
              </div>
            </motion.div>
          ))}
        </div>


        {/* Benefits Banner */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="relative bg-neutral-900 border border-white/10 rounded-[2.5rem] p-12 overflow-hidden"
        >
          {/* Subtle background gradient */}
          <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 via-transparent to-pink-500/5" />
          
          <h3 className="text-3xl font-black text-white text-center mb-12 relative z-10">
            Professional Perks
          </h3>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 relative z-10">
            {benefits.map((benefit, index) => (
              <div key={index} className="flex flex-col items-center text-center group">
                <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center text-3xl mb-4 group-hover:scale-110 transition-transform duration-500 border border-white/5">
                  {benefit.icon}
                </div>
                <h4 className="text-white font-bold mb-2 uppercase tracking-wide text-sm">{benefit.title}</h4>
                <p className="text-gray-500 text-xs leading-relaxed">{benefit.desc}</p>
              </div>
            ))}
          </div>
        </motion.div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-20 text-center"
        >
          <a
            href="https://discord.gg/nuxchain"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block px-12 py-5 bg-white text-black font-black rounded-2xl hover:bg-gray-200 transition-all active:scale-95 shadow-[0_0_40px_-10px_rgba(255,255,255,0.3)]"
          >
            APPLY ON DISCORD →
          </a>
          <p className="text-gray-500 text-xs mt-6 uppercase tracking-widest font-bold">
            Applications reviewed weekly via #collaborators
          </p>
        </motion.div>
      </div>
    </section>
  )
}

export default CollaboratorsSection
