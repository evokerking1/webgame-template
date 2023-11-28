import { useState } from "react";
import { client } from "../../core/Networking";
import { useAuth } from "../../contexts/AuthContext";
import { Navigate } from "react-router-dom";

function SignIn() {
  const { user } = useAuth();

  const [isLoading, setIsLoading] = useState(false);
  const [signinInAnonymously, setSignInAnonymously] = useState(false);
  const [error, setError] = useState("");

  // navigate to root ("/") once authenticated.
  if (user) {
    return <Navigate to="/" />;
  }

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const email = event.currentTarget.email.value;
    const password = event.currentTarget.password.value;
    try {
      setIsLoading(true);
      await client.auth.signInWithEmailAndPassword(email, password);

    } catch (e: any) {
      setError(`${e.name} - ${e.message}`);

    } finally {
      setIsLoading(false);
    }
  };

  const signInAnonymously = async (event: React.MouseEvent<HTMLButtonElement>) => {
    try {
      setIsLoading(true);
      setSignInAnonymously(true);
      await client.auth.signInAnonymously();

    } catch (e) {
      console.error(e);

    } finally {
      setSignInAnonymously(false);
      setIsLoading(false);
    }
  }

  const signInWithProvider = (provider: string) => {
    return async () => {
      try {
        setIsLoading(true);
        await client.auth.signInWithProvider(provider);

      } catch (e) {
        console.error(e);

      } finally {
        setIsLoading(false);
      }
    }
  };


  return (
    <div className={(isLoading) ? "pointer-events-none opacity-50 transition-all cursor-wait" : ""}>

      <div className="mb-8">
        <h2 className="text-xl mb-2">Anonymous login:</h2>
        <button onClick={signInAnonymously} type="submit" className="p-2 border rounded border-slate-500 hover:border-slate-400" disabled={signinInAnonymously}>Sign-in Anonymously</button>
      </div>

      <h2 className="text-xl mb-2">Email / Password:</h2>
      <form onSubmit={onSubmit} className="flex mb-8">
        <div className="flex gap-2">
          <input className="p-2 rounded text-slate-800" type="text" name="email" placeholder="Email" />
          <input className="p-2 rounded text-slate-800" type="password" name="password" placeholder="Password" />
          <button type="submit" className="p-2 border rounded border-slate-500 hover:border-slate-400">Sign in</button>
          {/* Error message */}
          { (error) && <p className="text-red-500">{error}</p> }
        </div>
      </form>

      <h2 className="text-xl mb-2">OAuth: (Configure at <code>packages/backend/src/config/auth.ts</code>)</h2>

      <div className="flex gap-2">
        <button onClick={signInWithProvider('discord')} className="p-2 border rounded border-slate-500 hover:border-slate-400">
          Login with Discord
        </button>

        <button onClick={signInWithProvider('google')} className="p-2 border rounded border-slate-500 hover:border-slate-400">
          Login with Google
        </button>
      </div>
    </div>
  )
}

export default SignIn
