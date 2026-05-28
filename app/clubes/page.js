'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';
import {
  ArrowLeft,
  CheckCircle2,
  Loader2,
  ShieldCheck,
  Globe2,
  Trophy,
  Plane,
  Users,
  Mail,
  Sparkles
} from 'lucide-react';

const initial = {
  club_name: '',
  country: '',
  city: '',
  category: '',
  contact_name: '',
  contact_role: '',
  email: '',
  whatsapp: '',
  instagram: '',
  website: '',
  athletes_count: '',
  competitive_history: '',
  travel_support: 'yes',
  notes: '',
  language: 'en',
  lgpd: false
};

export default function ClubInterestPage() {
  const [form, setForm] = useState(initial);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  function set(k, v) {
    setForm((prev) => ({ ...prev, [k]: v }));
  }

  async function submit(e) {
    e.preventDefault();
    setError('');
    setSuccess(false);
    setLoading(true);

    try {
      const res = await fetch('/api/club-interest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || data.message || 'Submission failed.');
      }

      setSuccess(true);
      setForm(initial);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="clubPage">

      <div className="clubPageBg one"></div>
      <div className="clubPageBg two"></div>

      <header className="clubHeader">

        <Link href="/" className="backLink">
          <ArrowLeft size={18} />
          Back to website
        </Link>

        <div className="clubHeaderBrand">
          <Image
            src="/assets/bfwc-logo.jpg"
            alt="Brasil Flag World Championship"
            width={70}
            height={70}
          />

          <span>
            Brasil Flag
            <br />
            World Championship
          </span>
        </div>

      </header>

      <section className="clubHero">

        <div className="clubHeroText">

          <p className="eyebrow">
            CLUB SELECTION PROCESS
          </p>

          <h1>
            Club interest
            <br />
            application.
          </h1>

          <p>
            Complete the information below. The championship committee will
            review your club profile and send an official response by email.
          </p>

          <div className="clubHeroBadges">

            <span>
              <ShieldCheck size={16} />
              Curated selection
            </span>

            <span>
              <Mail size={16} />
              Email confirmation
            </span>

            <span>
              <Globe2 size={16} />
              International clubs
            </span>

          </div>

        </div>

        <div className="clubHeroCard">

          <Image
            src="/assets/bfwc-logo.jpg"
            alt="BFWC 2026"
            width={260}
            height={260}
            priority
          />

          <div>

            <span>2026</span>

            <h2>
              Official review
              <br />
              for selected teams.
            </h2>

            <p>
              Submission does not guarantee automatic participation.
            </p>

          </div>

        </div>

      </section>

      <section className="selectionSteps">

        <div className="stepCard">

          <Users />

          <strong>1. Submit interest</strong>

          <span>
            The club sends institutional, competitive and contact information.
          </span>

        </div>

        <div className="stepCard">

          <Trophy />

          <strong>2. Committee review</strong>

          <span>
            The organization reviews category, history, profile and capacity.
          </span>

        </div>

        <div className="stepCard">

          <CheckCircle2 />

          <strong>3. Official response</strong>

          <span>
            The contact receives the approval or next steps by email.
          </span>

        </div>

        <div className="stepCard">

          <Plane />

          <strong>4. Travel support</strong>

          <span>
            Approved clubs may receive official Blue Panda Travel assistance.
          </span>

        </div>

      </section>

      {success && (
        <div className="successBox">
          <CheckCircle2 />
          Application received. Your club will receive a confirmation email and
          the organization will analyze your request.
        </div>
      )}

      <form className="premiumForm" onSubmit={submit}>

        <div className="formTop">

          <div>

            <p className="tag">
              OFFICIAL APPLICATION
            </p>

            <h2>
              Submit your club for analysis
            </h2>

            <p>
              Please fill in accurate information. This form will be sent to the
              BFWC organization team and stored for review.
            </p>

          </div>

          <div className="formSeal">

            <Sparkles />

            <span>
              Premium international event
            </span>

          </div>

        </div>

        <div className="formSection">

          <h3>
            Club information
          </h3>

          <div className="formGrid">

            <Input
              label="Club / Team name"
              value={form.club_name}
              onChange={(v) => set('club_name', v)}
              required
            />

            <Input
              label="Country"
              value={form.country}
              onChange={(v) => set('country', v)}
              required
            />

            <Input
              label="City"
              value={form.city}
              onChange={(v) => set('city', v)}
              required
            />

            <label>
              Category / Division
              <select
                value={form.category}
                onChange={(e) => set('category', e.target.value)}
                required
              >
                <option value="">Select</option>
                <option>Men</option>
                <option>Women</option>
                <option>Mixed</option>
                <option>U20 Men</option>
                <option>U20 Women</option>
                <option>Masters</option>
                <option>Other</option>
              </select>
            </label>

            <Input
              label="Instagram"
              value={form.instagram}
              onChange={(v) => set('instagram', v)}
            />

            <Input
              label="Website"
              value={form.website}
              onChange={(v) => set('website', v)}
            />

          </div>

        </div>

        <div className="formSection">

          <h3>
            Responsible contact
          </h3>

          <div className="formGrid">

            <Input
              label="Full name"
              value={form.contact_name}
              onChange={(v) => set('contact_name', v)}
              required
            />

            <Input
              label="Role"
              value={form.contact_role}
              onChange={(v) => set('contact_role', v)}
              required
            />

            <Input
              label="Email"
              type="email"
              value={form.email}
              onChange={(v) => set('email', v)}
              required
            />

            <Input
              label="WhatsApp"
              value={form.whatsapp}
              onChange={(v) => set('whatsapp', v)}
              required
            />

            <Input
              label="Estimated number of athletes/staff"
              type="number"
              value={form.athletes_count}
              onChange={(v) => set('athletes_count', v)}
            />

            <label>
              Needs travel support?
              <select
                value={form.travel_support}
                onChange={(e) => set('travel_support', e.target.value)}
              >
                <option value="yes">
                  Yes, Blue Panda support
                </option>

                <option value="no">
                  No
                </option>

                <option value="maybe">
                  Maybe
                </option>
              </select>
            </label>

          </div>

        </div>

        <label>
          Competitive history
          <textarea
            rows="5"
            value={form.competitive_history}
            onChange={(e) => set('competitive_history', e.target.value)}
            placeholder="Main tournaments, titles, league, federation, international experience..."
            required
          />
        </label>

        <label>
          Additional notes
          <textarea
            rows="4"
            value={form.notes}
            onChange={(e) => set('notes', e.target.value)}
            placeholder="Any relevant information about your club, travel group, expectations or questions..."
          />
        </label>

        <label className="check">
          <input
            type="checkbox"
            checked={form.lgpd}
            onChange={(e) => set('lgpd', e.target.checked)}
            required
          />

          <span>
            I authorize the organization to process this information for club
            selection, official communication and event-related opportunities.
          </span>
        </label>

        {error && (
          <p className="error">
            {error}
          </p>
        )}

        <button
          className="primaryBtn submitBtn"
          disabled={loading}
        >
          {loading ? (
            <Loader2 className="spin" size={18} />
          ) : (
            <ShieldCheck size={18} />
          )}

          {loading ? 'Submitting...' : 'Submit for official review'}
        </button>

      </form>

    </main>
  );
}

function Input({
  label,
  value,
  onChange,
  type = 'text',
  required = false
}) {
  return (
    <label>
      {label}
      <input
        type={type}
        value={value}
        required={required}
        onChange={(e) => onChange(e.target.value)}
      />
    </label>
  );
}