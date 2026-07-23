export default function PrivacyPolicy() {
  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fade-in-up pb-20 font-tech relative">
      <div className="absolute top-0 right-1/4 w-[400px] h-[400px] bg-sky-600/10 blur-[120px] pointer-events-none -z-10 rounded-full mix-blend-screen"></div>

      <div className="text-center space-y-4 relative z-10">
        <h1 className="text-3xl md:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-sky-400 via-purple-500 to-sky-400 animate-gradient tracking-widest drop-shadow-sm uppercase">
          PRIVACY_PROTOCOL
        </h1>
        <p className="text-sky-500/80 font-mono tracking-widest text-xs uppercase">LAST_MODIFIED: {new Date().toLocaleDateString('en-IN')}</p>
      </div>
      
      <div className="bg-zinc-950/80 backdrop-blur-xl rounded-2xl border border-sky-900/50 p-8 shadow-[0_0_30px_rgba(56,189,248,0.05)] space-y-8 text-zinc-400 font-mono text-xs leading-relaxed relative z-10">
        <section>
          <h2 className="text-sm font-bold text-sky-400 mb-4 tracking-widest uppercase border-b border-sky-900/30 pb-2">1. SYSTEM_INTRODUCTION</h2>
          <p>Welcome to ByteSquish. We respect your privacy and are committed to protecting your personal data. This privacy policy will inform you as to how we look after your personal data when you visit our website (regardless of where you visit it from) and tell you about your privacy rights and how the law protects you, in compliance with the Information Technology Act, 2000 and the Information Technology (Reasonable Security Practices and Procedures and Sensitive Personal Data or Information) Rules, 2011 of India.</p>
        </section>
        
        <section>
          <h2 className="text-sm font-bold text-sky-400 mb-4 tracking-widest uppercase border-b border-sky-900/30 pb-2">2. DATA_COLLECTION_MATRIX</h2>
          <ul className="list-none space-y-3">
            <li className="flex items-start gap-2"><span className="text-sky-500 mt-0.5">{'>'}</span> <div><strong className="text-zinc-300">Identity_Data:</strong> Includes first name, last name, username or similar identifier.</div></li>
            <li className="flex items-start gap-2"><span className="text-sky-500 mt-0.5">{'>'}</span> <div><strong className="text-zinc-300">Contact_Data:</strong> Includes email address.</div></li>
            <li className="flex items-start gap-2"><span className="text-sky-500 mt-0.5">{'>'}</span> <div><strong className="text-zinc-300">Technical_Data:</strong> Includes internet protocol (IP) address, your login data, browser type and version, time zone setting and location, browser plug-in types and versions, operating system and platform, and other technology on the devices you use to access this website.</div></li>
            <li className="flex items-start gap-2"><span className="text-sky-500 mt-0.5">{'>'}</span> <div><strong className="text-zinc-300">Image_Data:</strong> Images you upload for compression. These are stored temporarily and are automatically deleted after 1 hour.</div></li>
          </ul>
        </section>
        
        <section>
          <h2 className="text-sm font-bold text-sky-400 mb-4 tracking-widest uppercase border-b border-sky-900/30 pb-2">3. DATA_UTILIZATION</h2>
          <p className="mb-4">We will only use your personal data when the law allows us to. Most commonly, we will use your personal data in the following circumstances:</p>
          <ul className="list-none space-y-3">
            <li className="flex items-start gap-2"><span className="text-sky-500 mt-0.5">{'>'}</span> To provide you with our image compression services.</li>
            <li className="flex items-start gap-2"><span className="text-sky-500 mt-0.5">{'>'}</span> To manage your account and authentication.</li>
            <li className="flex items-start gap-2"><span className="text-sky-500 mt-0.5">{'>'}</span> To notify you about changes to our terms or privacy policy.</li>
          </ul>
        </section>
        
        <section>
          <h2 className="text-sm font-bold text-sky-400 mb-4 tracking-widest uppercase border-b border-sky-900/30 pb-2">4. SECURITY_MEASURES</h2>
          <p>We have put in place appropriate security measures to prevent your personal data from being accidentally lost, used or accessed in an unauthorised way, altered or disclosed. In addition, we limit access to your personal data to those employees, agents, contractors and other third parties who have a business need to know.</p>
        </section>

        <section>
          <h2 className="text-sm font-bold text-sky-400 mb-4 tracking-widest uppercase border-b border-sky-900/30 pb-2">5. COMMUNICATION_LINK</h2>
          <p>If you have any questions about this privacy policy or our privacy practices, please contact us at: <a href="mailto:hello@isharankumar.com" className="text-sky-400 hover:text-sky-300 hover:underline transition-colors decoration-dotted underline-offset-4">hello@isharankumar.com</a></p>
        </section>
      </div>
    </div>
  );
}
