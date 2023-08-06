import Head from "next/head";
import Image from "next/image";
import { Inter } from "next/font/google";
import styles from "@/styles/Home.module.css";
import { useRef, useEffect, useState } from "react"; // Import the useRef and useState hooks
import { createClient } from "@supabase/supabase-js";

const inter = Inter({ subsets: ["latin"] });

const SUPABASE_URL = "https://lhdsgnuxycvcdxyaqogi.supabase.co";
const SUPABASE_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxoZHNnbnV4eWN2Y2R4eWFxb2dpIiwicm9sZSI6ImFub24iLCJpYXQiOjE2OTA5OTcwNzYsImV4cCI6MjAwNjU3MzA3Nn0.OWo7cW6tUL-QjLAwopJB65P68N_B4WXnSlBPjUrkxYY";

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

export default function Home() {
  const [user, setUser] = useState(null);
  const [userEmail, setUserEmail] = useState(null);

  async function LoginUser() {
    let { data, error } = await supabase.auth.signInWithOAuth({
      provider: "google",
    });
  }

  function DisplayWordWall() {
    const [wordWall, setWordWall] = useState([]);

    useEffect(() => {
      async function getWordWall() {
        const { data } = await supabase.from("word_wall").select("*");
        setWordWall(data || []); // If data is null, set an empty array
      }
      getWordWall();
    }, []);

    async function deletePost(dataID) {
      const { data, error } = await supabase
        .from("word_wall")
        .delete()
        .eq("id", dataID);

      if (error) {
        console.error("Error deleting post:", error);
        return;
      }

      console.log("Post deleted successfully:", data);
      location.reload();
    }

    return (
      <div>
        <h1>Word Wall</h1>
        <div className={styles.wordBoxHolder}>
          {wordWall?.map((post) => (
            <div
              key={post.id}
              className={styles.wordBox}
              style={{
                color: post.font_color,
                backgroundColor: post.box_color,
              }}
            >
              <p className={styles.wordBoxText}>{post.text_content}</p>
              <div className={styles.postedAt}>
                {new Date(post.posted_at).toLocaleString()}
              </div>

              {post.posted_by === userEmail ? (
                <button
                  className={styles.deleteButton}
                  onClick={() => deletePost(post.id)} // Pass the post ID here
                >
                  Delete
                </button>
              ) : (
                <></>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  }

  function CreatePost() {
    const [postText, setPostText] = useState("");
    const [fontColor, setFontColor] = useState("");
    const [boxColor, setBoxColor] = useState("");

    async function createNewPost() {
      const { data } = await supabase.from("word_wall").insert([
        {
          text_content: postText,
          font_color: fontColor,
          box_color: boxColor,
          posted_at: new Date(),
          posted_by: userEmail,
        },
      ]);
      console.log(data);
      console.log(user);
      location.reload();
    }

    return (
      <>
        <div className={styles.postForm}>
          <p className={styles.charCount}>{postText.length}/100</p>
          <textarea
            type="text"
            maxLength={100}
            placeholder="Enter your message for the wall here"
            onChange={(e) => setPostText(e.target.value)}
          />

          <p className={styles.colorLabel}>Font Color</p>
          <input type="color" onChange={(e) => setFontColor(e.target.value)} />
          <p className={styles.colorLabel}>Box Color</p>
          <input type="color" onChange={(e) => setBoxColor(e.target.value)} />
          <button className={styles.postButton} onClick={createNewPost}>
            Post
          </button>
        </div>
      </>
    );
  }

  function Login() {
    async function getUser() {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setUser(user);
      if (user) {
        setUserEmail(user.email);
      }
    }
    if (userEmail === null) {
      getUser();
    }

    if (userEmail) {
      return (
        <div className={styles.loggedIn}>
          <h1>Welcome to Word Wall, {userEmail}</h1>
          <button onClick={Logout}>Logout</button>
        </div>
      );
    }

    if (userEmail === null) {
      return (
        <div className={styles.login}>
          <h1>
            Welcome to Word Wall<br></br>To make a post on the wall, login below
          </h1>
          <button onClick={LoginUser}>Login with Google</button>
        </div>
      );
    }
  }

  async function Logout() {
    let { error } = await supabase.auth.signOut();
    setUserEmail(null);
    setUser(null);
    location.reload();
  }

  return (
    <>
      <Head>
        <title>WordWall</title>
        <meta name="description" content="Generated by create next app" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className={`${styles.main} ${inter.className}`}>
        <div className={styles.container}>
          <Login />
        </div>
        <div className={styles.containerWord}>
          <div className={styles.wordWall}>
            <DisplayWordWall />
          </div>
          <CreatePost />
        </div>
      </main>
    </>
  );
}
