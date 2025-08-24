import React from 'react';

interface FirestoreErrorModalProps {
  errorMessage: string;
}

const securityRules = `rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}`;

const FirestoreErrorModal: React.FC<FirestoreErrorModalProps> = ({ errorMessage }) => {

  const handleCopyToClipboard = () => {
    navigator.clipboard.writeText(securityRules).then(() => {
      alert('Rules copied to clipboard!');
    }, (err) => {
      console.error('Could not copy text: ', err);
      alert('Failed to copy rules. Please copy them manually.');
    });
  };

  const handleReload = () => {
    window.location.reload();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 z-50 flex justify-center items-center p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl" role="alertdialog" aria-modal="true" aria-labelledby="error-title">
        <div className="p-6">
          <div className="flex items-start gap-4">
            <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
              <svg className="h-6 w-6 text-red-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <div className="mt-0 text-left flex-grow">
              <h3 className="text-lg leading-6 font-bold text-slate-900" id="error-title">
                Action Required: Firestore Security Rules
              </h3>
              <div className="mt-2 text-sm text-slate-800 space-y-2">
                <p><strong>{errorMessage}</strong></p>
                <p>This error means your app is not authorized to access the database because the security rules in your Firebase project are too restrictive.</p>
                <p>To fix this, go to your Firebase project console:</p>
                <ol className="list-decimal list-inside pl-4 space-y-1">
                    <li>Navigate to <strong>Firestore Database &gt; Rules</strong> tab.</li>
                    <li>Replace the existing rules with the following:</li>
                </ol>
                <div className="relative bg-slate-800 text-white p-4 rounded-md my-2">
                    <pre className="text-sm whitespace-pre-wrap"><code>{securityRules}</code></pre>
                    <button 
                        onClick={handleCopyToClipboard}
                        className="absolute top-2 right-2 bg-slate-600 hover:bg-slate-500 text-white font-semibold py-1 px-2 text-xs rounded"
                    >
                        Copy
                    </button>
                </div>
                 <ol className="list-decimal list-inside pl-4 space-y-1" start={3}>
                    <li>Click <strong>Publish</strong>.</li>
                    <li>Return to this application and click the "Reload App" button below.</li>
                </ol>
              </div>
            </div>
          </div>
        </div>
        <div className="bg-slate-50 px-6 py-4 flex justify-end rounded-b-xl">
          <button
            type="button"
            className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-sky-600 text-base font-medium text-white hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500 sm:w-auto sm:text-sm"
            onClick={handleReload}
          >
            Reload App
          </button>
        </div>
      </div>
    </div>
  );
};

export default FirestoreErrorModal;
