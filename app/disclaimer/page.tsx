import Nav from "@/app/components/Nav";
import Link from "next/link";

export default function DisclaimerPage() {
  return (
    <main className="min-h-screen bg-[#0a0a0a] text-white">
      <Nav />
      <div className="max-w-3xl mx-auto px-6 py-12">
        <h1 className="text-4xl font-black mb-2">Disclaimer</h1>
        <p className="text-gray-500 text-sm mb-10">Last updated: March 2026</p>

        <div className="prose prose-invert max-w-none space-y-8 text-gray-300 leading-relaxed">

          <section>
            <h2 className="text-xl font-bold text-white mb-3">Aggregated Information Only</h2>
            <p>
              CheapAkiya.com is an independent listing aggregation and newsletter service. We compile, translate, and curate property listings sourced from third-party websites, public records, municipal akiya banks, and real estate portals. We are not a licensed real estate broker, agent, or property dealer in Japan or any other jurisdiction.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">No Warranty of Accuracy</h2>
            <p>
              While we make reasonable efforts to present accurate information, we cannot guarantee the completeness, accuracy, reliability, or timeliness of any listing, price, property detail, or data point on this site. Property listings may be out of date, already sold, or contain errors introduced during translation or aggregation. Prices shown in USD are estimates based on approximate exchange rates and may not reflect current market values.
            </p>
            <p className="mt-3">
              Enrichment data including station distances, flood risk scores, earthquake risk assessments, internet connectivity estimates, government subsidy information, and amenity proximity are provided as general guidance only and are not guaranteed to be accurate or current. This data is derived from third-party sources and publicly available databases and should not be relied upon for any purchasing decision.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">Not Legal or Financial Advice</h2>
            <p>
              Nothing on this site constitutes legal, financial, investment, or real estate advice. Purchasing property in Japan involves complex legal processes, local regulations, and financial considerations. You should independently verify all listing details and consult with a licensed Japanese real estate agent (不動産業者), a qualified legal professional familiar with Japanese property law, and a financial advisor before making any purchase decision.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">Government Subsidy Information</h2>
            <p>
              Subsidy programs, grant amounts, and eligibility requirements described on this site are sourced from publicly available prefectural and municipal government information. These programs change frequently. CheapAkiya.com makes no warranty that any subsidy program is currently active, that you will qualify, or that the amounts listed are current. Always verify directly with the relevant prefecture or municipal office before relying on any subsidy information.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">No Endorsement</h2>
            <p>
              Listing a property on CheapAkiya.com does not constitute an endorsement of the property, the seller, or the listing agency. Contact information provided for properties is sourced from third-party listing sites. We do not verify the identity, credentials, or reliability of any seller or agent.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">Foreign Ownership</h2>
            <p>
              While Japan currently has no legal restrictions on foreign nationals purchasing real estate, regulations and requirements may change. CheapAkiya.com provides general information only and does not guarantee the legality or feasibility of any specific purchase for any specific individual. Tax obligations, visa requirements, and residency regulations vary by individual circumstances.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">Limitation of Liability</h2>
            <p>
              To the maximum extent permitted by applicable law, CheapAkiya.com, its operators, affiliates, and contributors shall not be liable for any direct, indirect, incidental, consequential, or punitive damages arising from your use of this site, reliance on any information presented here, or any property transaction you undertake as a result of discovering a listing through our platform.
            </p>
            <p className="mt-3">
              Your use of this site is at your own risk.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">Third-Party Links</h2>
            <p>
              This site contains links to third-party websites including government portals, real estate agencies, and external resources. We are not responsible for the content, accuracy, or availability of any third-party site.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">Contact</h2>
            <p>
              For questions about this disclaimer or our data practices, contact us at{" "}
              <a href="mailto:newsletter@cheapakiya.com" className="text-[#e85d2f] hover:underline">
                newsletter@cheapakiya.com
              </a>.
            </p>
          </section>

        </div>

        <div className="mt-12 pt-8 border-t border-white/10">
          <Link href="/" className="text-gray-500 hover:text-white text-sm transition">← Back to home</Link>
        </div>
      </div>
    </main>
  );
}
