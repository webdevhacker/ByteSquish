export default function TermsAndConditions() {
  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fade-in-up pb-20 font-tech relative">
      <div className="absolute top-0 right-1/4 w-[400px] h-[400px] bg-purple-600/10 blur-[120px] pointer-events-none -z-10 rounded-full mix-blend-screen"></div>

      <div className="text-center space-y-4 relative z-10">
        <h1 className="text-3xl md:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-sky-500 to-purple-400 animate-gradient tracking-widest drop-shadow-sm uppercase">
          TERMS_AND_CONDITIONS
        </h1>
        <p className="text-purple-500/80 font-mono tracking-widest text-xs uppercase">LAST_MODIFIED: {new Date().toLocaleDateString('en-IN')}</p>
      </div>
      
      <div className="bg-white/80 dark:bg-zinc-950/80 backdrop-blur-xl rounded-2xl border border-purple-200 dark:border-purple-900/50 p-8 shadow-[0_0_30px_rgba(168,85,247,0.05)] space-y-8 text-zinc-700 dark:text-zinc-400 font-mono text-xs leading-relaxed relative z-10 transition-colors duration-300">
        <section>
          <h2 className="text-sm font-bold text-purple-600 dark:text-purple-400 mb-4 tracking-widest uppercase border-b border-purple-200 dark:border-purple-900/30 pb-2 transition-colors">1. AGREEMENT_TO_TERMS</h2>
          <p>These Terms and Conditions constitute a legally binding agreement made between you, whether personally or on behalf of an entity (“you”) and ByteSquish ("Company", "we", "us", or "our"), concerning your access to and use of the ByteSquish website as well as any other media form, media channel, mobile website or mobile application related, linked, or otherwise connected thereto (collectively, the "Site"). The Site operates under the jurisdiction of India.</p>
        </section>
        
        <section>
          <h2 className="text-sm font-bold text-purple-600 dark:text-purple-400 mb-4 tracking-widest uppercase border-b border-purple-200 dark:border-purple-900/30 pb-2 transition-colors">2. INTELLECTUAL_PROPERTY_RIGHTS</h2>
          <p>Unless otherwise indicated, the Site is our proprietary property and all source code, databases, functionality, software, website designs, audio, video, text, photographs, and graphics on the Site (collectively, the "Content") and the trademarks, service marks, and logos contained therein (the "Marks") are owned or controlled by us or licensed to us, and are protected by copyright and trademark laws and various other intellectual property rights and unfair competition laws of India, international copyright laws, and international conventions.</p>
        </section>
        
        <section>
          <h2 className="text-sm font-bold text-purple-600 dark:text-purple-400 mb-4 tracking-widest uppercase border-b border-purple-200 dark:border-purple-900/30 pb-2 transition-colors">3. USER_REPRESENTATIONS</h2>
          <p className="mb-4">By using the Site, you represent and warrant that:</p>
          <ul className="list-none space-y-3">
            <li className="flex items-start gap-2"><span className="text-purple-500 mt-0.5">{'>'}</span> <div>All registration information you submit will be true, accurate, current, and complete.</div></li>
            <li className="flex items-start gap-2"><span className="text-purple-500 mt-0.5">{'>'}</span> <div>You will maintain the accuracy of such information and promptly update such registration information as necessary.</div></li>
            <li className="flex items-start gap-2"><span className="text-purple-500 mt-0.5">{'>'}</span> <div>You have the legal capacity and you agree to comply with these Terms and Conditions.</div></li>
            <li className="flex items-start gap-2"><span className="text-purple-500 mt-0.5">{'>'}</span> <div>You will not access the Site through automated or non-human means, whether through a bot, script or otherwise without explicit permission.</div></li>
            <li className="flex items-start gap-2"><span className="text-purple-500 mt-0.5">{'>'}</span> <div>You will not use the Site for any illegal or unauthorized purpose.</div></li>
          </ul>
        </section>
        
        <section>
          <h2 className="text-sm font-bold text-purple-600 dark:text-purple-400 mb-4 tracking-widest uppercase border-b border-purple-200 dark:border-purple-900/30 pb-2 transition-colors">4. UPLOADED_CONTENT</h2>
          <p>You retain all your ownership rights in your images. We do not claim any ownership rights to the images you upload. Images are temporarily stored on our servers for the sole purpose of providing the compression service and are automatically deleted after one (1) hour. We are not responsible for any loss of data; you should always maintain copies of your original files.</p>
        </section>
        
        <section>
          <h2 className="text-sm font-bold text-purple-600 dark:text-purple-400 mb-4 tracking-widest uppercase border-b border-purple-200 dark:border-purple-900/30 pb-2 transition-colors">5. GOVERNING_LAW</h2>
          <p>These Terms shall be governed by and defined following the laws of India. ByteSquish and yourself irrevocably consent that the courts of India shall have exclusive jurisdiction to resolve any dispute which may arise in connection with these terms.</p>
        </section>

        <section>
          <h2 className="text-sm font-bold text-purple-600 dark:text-purple-400 mb-4 tracking-widest uppercase border-b border-purple-200 dark:border-purple-900/30 pb-2 transition-colors">6. COMMUNICATION_LINK</h2>
          <p>If you have any questions or concerns regarding these terms, please contact us at: <a href="mailto:hello@isharankumar.com" className="text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 hover:underline transition-colors decoration-dotted underline-offset-4">hello@isharankumar.com</a></p>
        </section>
      </div>
    </div>
  );
}
