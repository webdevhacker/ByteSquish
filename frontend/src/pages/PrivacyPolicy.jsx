export default function PrivacyPolicy() {
  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fade-in-up pb-20">
      <div className="text-center space-y-4">
        <h1 className="text-3xl md:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-sky-400 via-purple-500 to-sky-400 animate-gradient tracking-tight drop-shadow-sm">
          PRIVACY POLICY
        </h1>
        <p className="text-gray-500 font-tech">Last Updated: {new Date().toLocaleDateString('en-IN')}</p>
      </div>
      
      <div className="bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl rounded-2xl border border-gray-200 dark:border-zinc-800/50 p-8 shadow-xl space-y-6 text-gray-700 dark:text-gray-300">
        <section>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3">1. Introduction</h2>
          <p>Welcome to ByteSquish. We respect your privacy and are committed to protecting your personal data. This privacy policy will inform you as to how we look after your personal data when you visit our website (regardless of where you visit it from) and tell you about your privacy rights and how the law protects you, in compliance with the Information Technology Act, 2000 and the Information Technology (Reasonable Security Practices and Procedures and Sensitive Personal Data or Information) Rules, 2011 of India.</p>
        </section>
        
        <section>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3">2. Data We Collect</h2>
          <ul className="list-disc pl-5 space-y-2">
            <li><strong>Identity Data:</strong> Includes first name, last name, username or similar identifier.</li>
            <li><strong>Contact Data:</strong> Includes email address.</li>
            <li><strong>Technical Data:</strong> Includes internet protocol (IP) address, your login data, browser type and version, time zone setting and location, browser plug-in types and versions, operating system and platform, and other technology on the devices you use to access this website.</li>
            <li><strong>Image Data:</strong> Images you upload for compression. These are stored temporarily and are automatically deleted after 1 hour.</li>
          </ul>
        </section>
        
        <section>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3">3. How We Use Your Data</h2>
          <p>We will only use your personal data when the law allows us to. Most commonly, we will use your personal data in the following circumstances:</p>
          <ul className="list-disc pl-5 mt-2 space-y-2">
            <li>To provide you with our image compression services.</li>
            <li>To manage your account and authentication.</li>
            <li>To notify you about changes to our terms or privacy policy.</li>
          </ul>
        </section>
        
        <section>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3">4. Data Security</h2>
          <p>We have put in place appropriate security measures to prevent your personal data from being accidentally lost, used or accessed in an unauthorised way, altered or disclosed. In addition, we limit access to your personal data to those employees, agents, contractors and other third parties who have a business need to know.</p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3">5. Contact Us</h2>
          <p>If you have any questions about this privacy policy or our privacy practices, please contact us at: <a href="mailto:hello@isharankumar.com" className="text-sky-500 hover:underline">hello@isharankumar.com</a></p>
        </section>
      </div>
    </div>
  );
}
