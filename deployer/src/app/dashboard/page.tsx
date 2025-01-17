"use client"

import { useSession, signIn } from "next-auth/react";
import { useEffect, useState } from "react";
import axios from "axios";

export default function Dashboard() {
  const { data: session, status } = useSession();
  const [repos, setRepos] = useState([]);
  // const [repoName,setRepoName] = useState<string>("")

  async function fetchUserRepos(accessToken : string | undefined) {
    if (!accessToken) return;
    try {
      const response = await axios.get("https://api.github.com/user/repos", {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          Accept: "application/vnd.github+json",
        },
      });
      return response.data;
    } catch (error) {
      console.error("Failed to fetch repositories:", error);
      return [];
    }
  }

  async function setWebhhokUrl(accessToken : string | undefined,owner : string | undefined | null, repoName : string | undefined) {
    try {
        const response = await axios.post(`https://api.github.com/repos/${owner}/${repoName}/hooks`,{
            name: "web",
            active: true,
            events: ["push"],
            config: {
              url: "https://deployer.vanii.ai/api/webhook",
              content_type: "application/json",
            }
        },{
          headers : {
              'Authorization': `Bearer ${accessToken}`,
              'Accept': 'application/vnd.github+json',
              'Content-Type': 'application/json',
              'X-GitHub-Api-Version': '2022-11-28',
          }
        })
        console.log(response)
    } catch (error) {
      console.error("Failed to set webhook: ", error);
    }
  }

  useEffect(() => {
    if (session?.user?.accessToken) {
      fetchUserRepos(session.user.accessToken).then((data) => {
        console.log(data)
        setRepos(data);
      });
    }
  }, [session?.user?.accessToken]);

  if (status === "loading") return <p>Loading...</p>;

  if (!session || !session.user) {
    return (
      <div>
        <h1>You are not signed in</h1>
        <button onClick={() => signIn("github")}>Sign In with GitHub</button>
      </div>
    );
  }

  async function deployProject(githubUrl : string, id : number, repoName : string) {
      try {
          // setRepoName(repoName)
          // const response = await axios.post("http://localhost:4000/upload-code",{
          //   githubUrl,
          //   id
          // })
          await setWebhhokUrl(session?.user.accessToken,session?.user.name,repoName)
      } catch (error) {
          console.log(error)
      }
  }

  return (
    <div>
      <h1>Hello, {session.user.name}</h1>
      <h2>Your Repositories:</h2>
      <ul>
        {repos.map((repo : any) => (
          <div>
            <li key={repo.id}>{repo.full_name}</li>
            <button onClick={() => {
              deployProject(repo.clone_url,repo.id,repo.name)
            }}>Deploy</button>
          </div>
        ))}
      </ul>
    </div>
  );
}
