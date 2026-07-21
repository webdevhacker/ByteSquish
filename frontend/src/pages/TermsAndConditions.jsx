export default function TermsAndConditions() {
  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fade-in-up pb-20">
      <div className="text-center space-y-4">
        <h1 className="text-3xl md:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-sky-400 via-purple-500 to-sky-400 animate-gradient tracking-tight drop-shadow-sm">
          TERMS & CONDITIONS
        </h1>
        <p className="text-gray-500 font-tech">Last Updated: {new Date().toLocaleDateString('en-IN')}</p>
      </div>
      
      <div className="bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl rounded-2xl border border-gray-200 dark:border-zinc-800/50 p-8 shadow-xl space-y-6 text-gray-700 dark:text-gray-300">
        <section>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3">1. Agreement to Terms</h2>
          <p>These Terms and Conditions constitute a legally binding agreement made between you, whether personally or on behalf of an entity (“you”) and ByteSquish ("Company", "we", "us", or "our"), concerning your access to and use of the ByteSquish website as well as any other media form, media channel, mobile website or mobile application related, linked, or otherwise connected thereto (collectively, the "Site"). The Site operates under the jurisdiction of India.</p>
        </section>
        
        <section>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3">2. Intellectual Property Rights</h2>
          <p>Unless otherwise indicated, the Site is our proprietary property and all source code, databases, functionality, software, website designs, audio, video, text, photographs, and graphics on the Site (collectively, the "Content") and the trademarks, service marks, and logos contained therein (the "Marks") are owned or controlled by us or licensed to us, and are protected by copyright and trademark laws and various other intellectual property rights and unfair competition laws of India, international copyright laws, and international conventions.</p>
        </section>
        
        <section>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3">3. User Representations</h2>
          <p>By using the Site, you represent and warrant that:</p>
          <ul className="list-disc pl-5 mt-2 space-y-2">
            <li>All registration information you submit will be true, accurate, current, and complete.</li>
            <li>You will maintain the accuracy of such information and promptly update such registration information as necessary.</li>
            <li>You have the legal capacity and you agree to comply with these Terms and Conditions.</li>
            <li>You will not access the Site through automated or non-human means, whether through a bot, script or otherwise without explicit permission.</li>
            <li>You will not use the Site for any illegal or unauthorized purpose.</li>
          </ul>
        </section>
        
        <section>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3">4. Uploaded Content</h2>
          <p>You retain all your ownership rights in your images. We do not claim any ownership rights to the images you upload. Images are temporarily stored on our servers for the sole purpose of providing the compression service and are automatically deleted after one (1) hour. We are not responsible for any loss of data; you should always maintain copies of your original files.</p>
        </section>
        
        <section>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3">5. Governing Law</h2>
          <p>These Terms shall be governed by and defined following the laws of India. ByteSquish and yourself irrevocably consent that the courts of India shall have exclusive jurisdiction to resolve any dispute which may arise in connection with these terms.</p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3">6. Contact Us</h2>
          <p>If you have any questions or concerns regarding these terms, please contact us at: <a href="mailto:hello@isharankumar.com" className="text-sky-500 hover:underline">hello@isharankumar.com</a></p>
        </section>
      </div>
    </div>
  );
}
