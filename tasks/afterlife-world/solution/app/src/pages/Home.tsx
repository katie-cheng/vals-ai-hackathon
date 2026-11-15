import { Link } from "react-router-dom";
import { useEffect } from "react";
import { KINDS } from "../server/types";
import { SiteFooter, SiteHeader } from "../components/SiteChrome";

const SHARED = [
  ["Account and profile", "Your name, username, password and cloak."],
  ["Lumens", "The island's currency. Gather lights to earn them, spend them at the market."],
  ["Inventory", "Cloaks and things for your home."],
  ["Homes", "Up to two plots on the hillside or the shore."],
  ["Friends and messages", "Requests, your friends list, world chat and direct messages."],
  ["Purchases and progress", "Every receipt, the lights you have gathered and the places you have been."],
];

export default function Home() {
  useEffect(() => {
    document.title = "AFTERLIFE: a shared 3D world in your browser";
  }, []);
  return (
    <>
      <SiteHeader />
      <main>
        <section className="hero">
          <div className="wrap hero-grid">
            <div className="hero-copy">
              <h1>AFTERLIFE</h1>
              <p className="lede">
                A small island where souls meet after hours. Walk it with friends, gather lights, trade at the market and build a home. It opens in your
                browser, with nothing to install.
              </p>
              <div className="button-row">
                <Link to="/world" className="btn btn-primary">Enter the world</Link>
                <a href="#devices" className="btn btn-quiet">How it plays on your device</a>
              </div>
            </div>
            <figure className="hero-shot">
              <img src="/images/world-plaza.jpg" width={1280} height={800} alt="Lantern Plaza in AFTERLIFE at dusk: a stone circle around a tree hung with lanterns, with market stalls to the right." />
            </figure>
          </div>
        </section>

        <section id="devices" className="section">
          <div className="wrap">
            <h2>Plays on the device you have</h2>
            <p className="section-lede">AFTERLIFE checks what it is running on when you enter, then sets the controls, the layout and the graphics for it. You can change any of it in Settings.</p>
            <div className="columns">
              <article>
                <h3>Laptops and desktops</h3>
                <p>Walk with W, A, S and D or the arrow keys, run with Shift and jump with Space. Drag with the mouse to look around and scroll to zoom. World chat sits in the corner.</p>
              </article>
              <article>
                <h3>Phones and tablets</h3>
                <p>Two virtual joysticks: the left one walks, the right one turns the camera, with a jump button between them. Panels open as sheets from the bottom of the screen.</p>
              </article>
              <article>
                <h3>Graphics that fit</h3>
                <p>Phones and computers without a strong GPU start at Low: lower resolution, no shadows, fewer trees and a shorter view. If the frame rate drops, quality steps down on its own.</p>
              </article>
            </div>
          </div>
        </section>

        <section className="section section-alt">
          <div className="wrap split-section">
            <div>
              <h2>One account, kept by the world server</h2>
              <p>
                Every change goes through the world server, which checks your session and validates the request: you can't spend lumens you don't have,
                gather a light from across the island or message someone who isn't your friend.
              </p>
              <p>
                In this version the world server runs inside your browser and keeps its data there. Every AFTERLIFE tab you open on the same browser shares one
                account and one world, live: chat, players walking around, purchases and homes appear in the other tabs straight away. Syncing between separate
                devices starts once the hosted server is connected.
              </p>
            </div>
            <dl className="shared-list">
              {SHARED.map(([t, d]) => (
                <div key={t}>
                  <dt>{t}</dt>
                  <dd>{d}</dd>
                </div>
              ))}
            </dl>
          </div>
        </section>

        <section className="section">
          <div className="wrap split-section">
            <div>
              <h2>Notifications</h2>
              <p>
                New notifications appear in the world as they happen and collect in your history with an unread count. Each kind can be turned on or off for
                the world and for browser notifications, and you can mute everything for an hour, eight hours or until you unmute.
              </p>
              <p>
                AFTERLIFE never asks for browser permission on its own. You turn browser notifications on in the notification preferences, read what they do,
                and only then does your browser ask.
              </p>
              <p className="muted">
                Notifications while AFTERLIFE is closed are not available yet: they need the hosted push server, which is not connected. Until then they reach you
                while a tab is open, even in the background.
              </p>
            </div>
            <ul className="kind-list">
              {KINDS.map((k) => (
                <li key={k.id}>
                  <strong>{k.label}</strong>
                  <span>{k.about}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section className="section section-alt">
          <div className="wrap split-section">
            <div>
              <h2>Android app</h2>
              <p>
                There is no Android app to download yet. We will only publish a signed release that has been verified, with its real version number and file
                size. Until the signing key, the push service and the hosted server exist, there is nothing honest to offer, so there is no download button.
              </p>
              <Link to="/android" className="btn btn-quiet">What the Android release needs</Link>
            </div>
            <div>
              <h3>Meanwhile on Android</h3>
              <p>Open AFTERLIFE in Chrome on your phone. It is the complete world, with touch joysticks and the same account as your other tabs on that phone.</p>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
