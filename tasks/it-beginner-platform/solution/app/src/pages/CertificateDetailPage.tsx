import { Link, useParams } from "react-router-dom";
import { ChevronLeft, Printer } from "lucide-react";
import { useCourse } from "../context/CourseContext";

export const CertificateDetailPage = () => {
  const { code } = useParams();
  const { certificates } = useCourse();
  const certificate: any = certificates.find((item: any) => item.certificateCode === code);

  if (!certificate) {
    return (
      <div className="container-page page">
        <h1 className="page-title">Certificate not found</h1>
        <p className="lead mt-2">
          No certificate with the code <span className="break-all font-mono text-[0.9375rem]">{code}</span> is saved in this browser.
        </p>
        <Link to="/certificates" className="btn btn-secondary mt-6">
          All certificates
        </Link>
      </div>
    );
  }
  const name = certificate.userName;
  const course = certificate.chapterTitle;
  const serial = certificate.certificateCode;
  const issued = certificate.issuedAt;

  return (
    <div className="container-page page">
      <div className="mx-auto max-w-4xl">
        <div className="no-print flex flex-wrap items-center justify-between gap-4">
          <Link to="/certificates" className="inline-flex items-center gap-1 text-sm text-ink-3 transition-colors hover:text-ink">
            <ChevronLeft className="h-4 w-4" strokeWidth={1.75} aria-hidden="true" />
            All certificates
          </Link>
          <button type="button" onClick={() => window.print()} className="btn btn-quiz">
            <Printer aria-hidden="true" />
            Print or save as PDF
          </button>
        </div>
        <article className="cert-print-container mt-6 border-4 border-double border-accent bg-raised px-6 py-12 text-center sm:px-14 sm:py-16">
          <p className="font-display text-lg font-semibold tracking-wide text-accent">AjinLab Education</p>
          <h1 className="mt-2 text-sm font-normal tracking-normal text-ink-3">Certificate of curriculum completion</h1>
          <p className="mt-12 text-sm text-ink-3">This is to certify that</p>
          <p className="mt-3 font-display text-3xl font-semibold text-ink sm:text-5xl">{name}</p>
          <p className="mx-auto mt-6 max-w-xl text-sm text-ink-2">
            has successfully fulfilled all curriculum requirements, hands-on programming projects, and assessment
            milestones for
          </p>
          <p className="mt-4 font-display text-xl font-semibold text-accent sm:text-2xl">{course}</p>
          <p className="mx-auto mt-4 max-w-xl text-sm text-ink-3">
            Covering modern software lifecycles, Agile and Scrum, deep JavaScript ES6+, HTML5, CSS3 Flexbox layout,
            NPM tooling, Vue.js reactive single-page architecture, and client-server REST communication.
          </p>
          <dl className="mt-12 grid grid-cols-1 gap-6 border-t border-line pt-8 text-sm sm:grid-cols-3 sm:text-left">
            <div>
              <dt className="meta">Date issued</dt>
              <dd className="mt-1 text-ink">{issued}</dd>
            </div>
            <div>
              <dt className="meta">Serial code</dt>
              <dd className="mt-1 break-all font-mono text-quiz">{serial}</dd>
            </div>
            <div>
              <dt className="meta">Lead curriculum instructor</dt>
              <dd className="mt-1 text-ink">iAzazelOfc / AjinLab</dd>
            </div>
          </dl>
        </article>
      </div>
    </div>
  );
};
