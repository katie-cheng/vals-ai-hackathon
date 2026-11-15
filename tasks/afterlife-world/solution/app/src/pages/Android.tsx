import { useEffect } from "react";
import { Link } from "react-router-dom";
import { SiteFooter, SiteHeader } from "../components/SiteChrome";

const NEEDS = [
  ["Hosted AFTERLIFE server", "Accounts, inventory, lumens, friends, messages, homes and purchases have to live on a server both the website and the app reach over HTTPS, with a WebSocket endpoint for multiplayer. Today the world server runs inside each browser, so an app could not share your account."],
  ["Android project", "A Kotlin app (package ai.afterlife.world, minimum Android 8.0) that signs in against the hosted server, joins the same multiplayer world and registers for push."],
  ["Firebase Cloud Messaging", "A Firebase project and its google-services.json for the app, plus a server key on the hosted server to send friend requests, messages and other notifications to phones."],
  ["Release signing keystore", "An upload key generated with keytool, kept in a secrets manager and never committed, with Play App Signing holding the app signing key."],
  ["Build machine", "The Android SDK, build tools and a CI job that builds the release and signs it. This build environment has none of these."],
];

const STEPS = [
  "Generate the upload keystore once: keytool -genkeypair -v -keystore afterlife-upload.jks -alias afterlife -keyalg RSA -keysize 4096 -validity 10000.",
  "Store the keystore and its passwords in the CI secrets manager; the build reads them from environment variables and the file never enters the repository.",
  "Build the release on CI with ./gradlew assembleRelease, which signs it with the upload key.",
  "Verify before publishing: apksigner verify --print-certs must pass and show the expected certificate fingerprint, and the APK is installed on a test phone to sign in and receive a test push.",
  "Publish the verified APK here with its version name, version code, file size and SHA-256 checksum read from the file itself.",
];

export default function Android() {
  useEffect(() => {
    document.title = "AFTERLIFE for Android";
  }, []);
  return (
    <>
      <SiteHeader />
      <main className="section">
        <div className="wrap narrow">
          <h1>AFTERLIFE for Android</h1>
          <div className="status-box" role="status">
            <h2>No APK yet</h2>
            <p>
              No Android release has been built or signed, so there is nothing to download. The website stays the complete AFTERLIFE on every device,
              including Android phones.
            </p>
            <Link to="/world" className="btn btn-primary btn-small">Open the world in your browser</Link>
          </div>

          <h2>What the release needs</h2>
          <dl className="needs">
            {NEEDS.map(([t, d]) => (
              <div key={t}>
                <dt>{t}</dt>
                <dd>{d}</dd>
              </div>
            ))}
          </dl>

          <h2>How it will be signed and checked</h2>
          <ol className="steps">
            {STEPS.map((s) => <li key={s}>{s}</li>)}
          </ol>
          <p className="muted">Once a signed and verified release exists, this page will show its download with the real version and file size. It will not show a download count.</p>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
