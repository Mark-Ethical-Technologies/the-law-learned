import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Font,
} from "@react-pdf/renderer";

// Register fonts - using standard PDF fonts to avoid external fetch
Font.register({
  family: "Helvetica",
  fonts: [
    { src: "Helvetica" },
    { src: "Helvetica-Bold", fontWeight: "bold" },
  ],
});

const styles = StyleSheet.create({
  page: {
    fontFamily: "Helvetica",
    fontSize: 11,
    paddingTop: 60,
    paddingBottom: 60,
    paddingHorizontal: 70,
    color: "#1a1a1a",
    lineHeight: 1.5,
  },
  privilegeBox: {
    backgroundColor: "#fefce8",
    border: "1px solid #ca8a04",
    padding: 10,
    marginBottom: 20,
    borderRadius: 4,
  },
  privilegeText: {
    fontSize: 9,
    color: "#92400e",
    lineHeight: 1.4,
  },
  header: {
    borderBottom: "2px solid #1B3A5C",
    paddingBottom: 14,
    marginBottom: 20,
  },
  coverTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#1B3A5C",
    marginBottom: 4,
  },
  coverSubtitle: {
    fontSize: 13,
    color: "#C9A84C",
    marginBottom: 8,
  },
  coverMeta: {
    fontSize: 9,
    color: "#666",
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#1B3A5C",
    marginTop: 20,
    marginBottom: 8,
    borderBottom: "1px solid #e5e7eb",
    paddingBottom: 4,
  },
  subsectionTitle: {
    fontSize: 11,
    fontWeight: "bold",
    color: "#374151",
    marginTop: 12,
    marginBottom: 4,
  },
  bodyText: {
    fontSize: 10,
    color: "#374151",
    lineHeight: 1.6,
    marginBottom: 8,
  },
  labelValue: {
    flexDirection: "row",
    marginBottom: 4,
  },
  label: {
    fontSize: 10,
    fontWeight: "bold",
    color: "#6b7280",
    width: 140,
  },
  value: {
    fontSize: 10,
    color: "#1a1a1a",
    flex: 1,
  },
  infoBox: {
    backgroundColor: "#f0f9ff",
    border: "1px solid #bae6fd",
    padding: 10,
    borderRadius: 4,
    marginBottom: 12,
  },
  infoBoxText: {
    fontSize: 10,
    color: "#0c4a6e",
    lineHeight: 1.5,
  },
  footer: {
    position: "absolute",
    bottom: 30,
    left: 70,
    right: 70,
    borderTop: "1px solid #e5e7eb",
    paddingTop: 8,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  footerText: {
    fontSize: 8,
    color: "#9ca3af",
  },
  pageNumber: {
    fontSize: 8,
    color: "#9ca3af",
  },
});

export interface MatterPackData {
  workerName: string;
  employer: string;
  industry: string;
  awardName: string;
  employmentStartDate?: string;
  currentStatus?: string;
  account: string; // Full narrative from PEACE interview
  issuesSummary: string; // Brief summary of issues identified
  nextSteps: string; // Recommended next steps
  generatedAt: string;
  sessionId: string;
}

export function MatterPackDocument({ data }: { data: MatterPackData }) {
  const dateStr = new Date(data.generatedAt).toLocaleDateString("en-AU", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <Document
      title={`Matter Pack — ${data.workerName}`}
      author="Fair Work Help"
      subject="Matter Pack — Workplace Underpayment Preparation Document"
    >
      {/* Cover page */}
      <Page size="A4" style={styles.page}>
        <View style={styles.privilegeBox}>
          <Text style={styles.privilegeText}>
            PRIVILEGED AND CONFIDENTIAL — DOMINANT PURPOSE: PREPARATION FOR LEGAL PROCEEDINGS{"\n"}
            This document is prepared for the dominant purpose of legal proceedings and is subject to
            legal professional privilege under the principle established in Esso Australia Resources
            Pty Ltd v Commissioner of Taxation (1999) 201 CLR 49. Do not disclose to third parties
            without legal advice.
          </Text>
        </View>

        <View style={styles.header}>
          <Text style={styles.coverTitle}>Matter Pack</Text>
          <Text style={styles.coverSubtitle}>Fair Work Act 2009 — Underpayment Preparation File</Text>
          <Text style={styles.coverMeta}>Fair Work Help — fairworkhelp.app — Legal Education Platform</Text>
        </View>

        <View style={styles.sectionTitle}>
          <Text>Worker Details</Text>
        </View>

        <View style={styles.labelValue}>
          <Text style={styles.label}>Worker:</Text>
          <Text style={styles.value}>{data.workerName}</Text>
        </View>
        <View style={styles.labelValue}>
          <Text style={styles.label}>Employer:</Text>
          <Text style={styles.value}>{data.employer}</Text>
        </View>
        <View style={styles.labelValue}>
          <Text style={styles.label}>Industry:</Text>
          <Text style={styles.value}>{data.industry}</Text>
        </View>
        <View style={styles.labelValue}>
          <Text style={styles.label}>Applicable Award:</Text>
          <Text style={styles.value}>{data.awardName || "To be confirmed with legal practitioner"}</Text>
        </View>
        {data.employmentStartDate && (
          <View style={styles.labelValue}>
            <Text style={styles.label}>Employment commenced:</Text>
            <Text style={styles.value}>{data.employmentStartDate}</Text>
          </View>
        )}
        {data.currentStatus && (
          <View style={styles.labelValue}>
            <Text style={styles.label}>Current status:</Text>
            <Text style={styles.value}>{data.currentStatus}</Text>
          </View>
        )}
        <View style={styles.labelValue}>
          <Text style={styles.label}>Document generated:</Text>
          <Text style={styles.value}>{dateStr}</Text>
        </View>
        <View style={styles.labelValue}>
          <Text style={styles.label}>Session reference:</Text>
          <Text style={styles.value}>{data.sessionId}</Text>
        </View>

        <View style={[styles.sectionTitle, { marginTop: 24 }]}>
          <Text>Issues Identified</Text>
        </View>
        <Text style={styles.bodyText}>{data.issuesSummary}</Text>

        <View style={styles.infoBox}>
          <Text style={styles.infoBoxText}>
            IMPORTANT: This document is produced by Fair Work Help, a legal education platform. It
            does not constitute legal advice. The information in this document should be reviewed by a
            qualified Australian legal practitioner before any formal proceedings are commenced. The
            Fair Work Ombudsman also provides free complaint and investigation services at fairwork.gov.au.
          </Text>
        </View>

        <View style={styles.footer} fixed>
          <Text style={styles.footerText}>Fair Work Help — Legal Education Platform — fairworkhelp.app</Text>
          <Text
            style={styles.pageNumber}
            render={({ pageNumber, totalPages }) => `Page ${pageNumber} of ${totalPages}`}
          />
        </View>
      </Page>

      {/* Account narrative page */}
      <Page size="A4" style={styles.page}>
        <View style={styles.privilegeBox}>
          <Text style={styles.privilegeText}>
            PRIVILEGED AND CONFIDENTIAL — DOMINANT PURPOSE: PREPARATION FOR LEGAL PROCEEDINGS
          </Text>
        </View>

        <View style={styles.sectionTitle}>
          <Text>Worker&apos;s Account</Text>
        </View>
        <Text style={[styles.bodyText, { fontSize: 9, color: "#6b7280", marginBottom: 12 }]}>
          The following account was recorded during a PEACE cognitive interview conducted on {dateStr}.
          It represents the worker&apos;s own recollection in their own words, structured through the
          account phase of the interview.
        </Text>

        <Text style={styles.bodyText}>{data.account}</Text>

        <View style={styles.footer} fixed>
          <Text style={styles.footerText}>Fair Work Help — Legal Education Platform — fairworkhelp.app</Text>
          <Text
            style={styles.pageNumber}
            render={({ pageNumber, totalPages }) => `Page ${pageNumber} of ${totalPages}`}
          />
        </View>
      </Page>

      {/* Next steps page */}
      <Page size="A4" style={styles.page}>
        <View style={styles.privilegeBox}>
          <Text style={styles.privilegeText}>
            PRIVILEGED AND CONFIDENTIAL — DOMINANT PURPOSE: PREPARATION FOR LEGAL PROCEEDINGS
          </Text>
        </View>

        <View style={styles.sectionTitle}>
          <Text>Recommended Next Steps</Text>
        </View>
        <Text style={styles.bodyText}>{data.nextSteps}</Text>

        <View style={styles.sectionTitle}>
          <Text>Official Resources</Text>
        </View>

        <View style={styles.infoBox}>
          <Text style={styles.subsectionTitle}>Fair Work Ombudsman</Text>
          <Text style={styles.infoBoxText}>
            The Fair Work Ombudsman (FWO) investigates underpayment complaints for free. They can
            recover unpaid wages on your behalf and impose penalties on employers.{"\n"}
            Website: fairwork.gov.au{"\n"}
            Phone: 13 13 94
          </Text>
        </View>

        <View style={styles.infoBox}>
          <Text style={styles.subsectionTitle}>Fair Work Commission</Text>
          <Text style={styles.infoBoxText}>
            The Fair Work Commission handles unfair dismissal applications, general protections
            claims, and award variations.{"\n"}
            Website: fwc.gov.au{"\n"}
            Phone: 1300 799 675
          </Text>
        </View>

        <View style={styles.infoBox}>
          <Text style={styles.subsectionTitle}>Limitation Period Warning</Text>
          <Text style={styles.infoBoxText}>
            Under the Fair Work Act 2009, underpayment claims have a 6-year limitation period from
            the date the underpayment occurred. Time limits apply. Seek legal advice promptly.
          </Text>
        </View>

        <Text style={[styles.bodyText, { fontSize: 9, color: "#6b7280", marginTop: 20 }]}>
          Fair Work Help is a legal education platform operated by Ethical Technologies Pty Ltd. This
          document does not constitute legal advice and should not be relied upon as such. All content
          is produced for educational purposes and to assist workers in preparing for consultation
          with qualified Australian legal practitioners. For legal advice specific to your situation,
          consult a registered Australian legal practitioner or contact a community legal centre.
        </Text>

        <View style={styles.footer} fixed>
          <Text style={styles.footerText}>Fair Work Help — Legal Education Platform — fairworkhelp.app</Text>
          <Text
            style={styles.pageNumber}
            render={({ pageNumber, totalPages }) => `Page ${pageNumber} of ${totalPages}`}
          />
        </View>
      </Page>

      {/* Demand letter page */}
      <Page size="A4" style={styles.page}>
        {/* Sender details */}
        <View style={{ marginBottom: 20 }}>
          <Text style={[styles.bodyText, { fontWeight: "bold", marginBottom: 2 }]}>
            {data.workerName}
          </Text>
          <Text style={styles.bodyText}>{dateStr}</Text>
          <Text style={{ fontSize: 10, color: "#1a1a1a", marginTop: 8, marginBottom: 0 }}> </Text>
          <Text style={[styles.bodyText, { fontWeight: "bold", letterSpacing: 1 }]}>
            WITHOUT PREJUDICE
          </Text>
        </View>

        {/* Addressee */}
        <View style={{ marginBottom: 20 }}>
          <Text style={[styles.bodyText, { fontWeight: "bold", marginBottom: 2 }]}>To:</Text>
          <Text style={styles.bodyText}>{data.employer}</Text>
          <Text style={[styles.bodyText, { color: "#9ca3af" }]}>
            [Employer address — insert before sending]
          </Text>
        </View>

        {/* Subject line */}
        <View style={{ borderBottom: "2px solid #1B3A5C", paddingBottom: 10, marginBottom: 16 }}>
          <Text style={{ fontSize: 11, fontWeight: "bold", color: "#1B3A5C" }}>
            SUBJECT: DEMAND FOR PAYMENT OF UNDERPAID WAGES AND ENTITLEMENTS
          </Text>
        </View>

        {/* Salutation */}
        <Text style={styles.bodyText}>
          Dear {data.employer !== "Employer not specified" ? data.employer : "Sir or Madam"},
        </Text>

        {/* Opening paragraph */}
        <Text style={styles.bodyText}>
          I write to formally demand payment of wages and entitlements I believe are owed to me
          under the {data.awardName && data.awardName !== "To be confirmed" ? data.awardName : "relevant Modern Award"} or the National Employment Standards, as documented in the
          attached privileged preparation file.
        </Text>

        {/* Summary of claim */}
        <View style={[styles.sectionTitle, { marginTop: 14 }]}>
          <Text>SUMMARY OF CLAIM</Text>
        </View>
        <Text style={[styles.bodyText, { marginBottom: 6 }]}>
          {data.issuesSummary && data.issuesSummary !== "Issues to be identified through interview process."
            ? data.issuesSummary
            : "See attached account for full details of the matters in dispute."}
        </Text>

        {/* Payment demand */}
        <View style={[styles.sectionTitle, { marginTop: 14 }]}>
          <Text>PAYMENT DEMAND</Text>
        </View>
        <Text style={styles.bodyText}>
          I request that you review this matter and contact me within 14 days to resolve this
          dispute. If this matter is not resolved, I intend to lodge a complaint with the Fair Work
          Commission.
        </Text>

        {/* Important dates */}
        <View style={[styles.sectionTitle, { marginTop: 14 }]}>
          <Text>IMPORTANT DATES</Text>
        </View>
        <View style={{ marginBottom: 4 }}>
          <Text style={styles.bodyText}>
            Time limit: Underpayment claims must be lodged within 6 years of the underpayment
            occurring.
          </Text>
        </View>
        <View style={styles.infoBox}>
          <Text style={styles.infoBoxText}>
            Fair Work Commission: 1300 799 675 | www.fwc.gov.au{"\n"}
            Fair Work Ombudsman: 13 13 94 | www.fairwork.gov.au
          </Text>
        </View>

        {/* Closing */}
        <View style={{ marginTop: 20 }}>
          <Text style={styles.bodyText}>Yours sincerely,</Text>
          <Text style={{ fontSize: 10, color: "#1a1a1a", marginTop: 32, marginBottom: 0 }}>
            {data.workerName}
          </Text>
          <Text style={[styles.bodyText, { color: "#9ca3af" }]}>
            [Sign above before sending]
          </Text>
        </View>

        {/* Page footer with privilege notice */}
        <View style={styles.footer} fixed>
          <Text style={[styles.footerText, { flex: 1 }]}>
            PRIVILEGED AND CONFIDENTIAL — DOMINANT PURPOSE: PREPARATION FOR LEGAL PROCEEDINGS / Esso Australia Resources Pty Ltd v Commissioner of Taxation (1999) 201 CLR 49
          </Text>
          <Text
            style={[styles.pageNumber, { marginLeft: 8 }]}
            render={({ pageNumber, totalPages }) => `Page ${pageNumber} of ${totalPages}`}
          />
        </View>
      </Page>
    </Document>
  );
}
