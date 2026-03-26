/// <reference types="npm:@types/react@18.3.1" />
import * as React from 'npm:react@18.3.1'
import {
  Body, Container, Head, Heading, Html, Preview, Text, Button, Section, Hr,
} from 'npm:@react-email/components@0.0.22'
import type { TemplateEntry } from './registry.ts'

const SITE_NAME = 'RFPN'

interface BrokerAllocationProps {
  applicantName?: string
  projectType?: string
  loanAmount?: string
  applicationId?: string
}

const BrokerAllocationEmail = ({
  applicantName = 'N/A',
  projectType = 'Development Funding',
  loanAmount = 'Not specified',
  applicationId = '',
}: BrokerAllocationProps) => {
  const secureLink = applicationId
    ? `https://rfpn-net.lovable.app/broker/applications/${applicationId}`
    : 'https://rfpn-net.lovable.app/broker'

  return (
    <Html lang="en" dir="ltr">
      <Head />
      <Preview>New application allocated to you – {SITE_NAME} Platform</Preview>
      <Body style={main}>
        <Container style={container}>
          {/* Header */}
          <Section style={header}>
            <Heading style={headerTitle}>{SITE_NAME}</Heading>
          </Section>

          {/* Content */}
          <Section style={content}>
            <Heading style={h1}>New Application Allocated</Heading>
            <Text style={text}>
              A new application has been allocated to JAG Finance on the {SITE_NAME} platform.
            </Text>

            {/* Application Details Table */}
            <Section style={detailsBox}>
              <table style={detailsTable} cellPadding="0" cellSpacing="0">
                <tbody>
                  <tr>
                    <td style={labelCell}>Applicant Name</td>
                    <td style={valueCell}>{applicantName}</td>
                  </tr>
                  <tr>
                    <td style={labelCell}>Project Type</td>
                    <td style={valueCell}>{projectType}</td>
                  </tr>
                  <tr>
                    <td style={{ ...labelCell, borderBottom: 'none' }}>Loan Amount</td>
                    <td style={{ ...valueCell, borderBottom: 'none' }}>{loanAmount}</td>
                  </tr>
                </tbody>
              </table>
            </Section>

            <Text style={text}>
              To view full details, access the system using the link below. Login is required.
            </Text>

            <Section style={buttonContainer}>
              <Button style={button} href={secureLink}>
                View Application
              </Button>
            </Section>

            <Text style={linkFallback}>
              If the button doesn't work, copy and paste this link:{' '}
              <span style={linkText}>{secureLink}</span>
            </Text>
          </Section>

          <Hr style={divider} />

          {/* Footer */}
          <Section style={footer}>
            <Text style={footerText}>
              {SITE_NAME} System — Property Finance Network
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  )
}

export const template = {
  component: BrokerAllocationEmail,
  subject: 'New Application Allocated – RFPN Platform',
  displayName: 'Broker allocation notification',
  previewData: {
    applicantName: 'John Smith',
    projectType: 'Development Funding',
    loanAmount: '£500,000',
    applicationId: 'test-uuid-123',
  },
} satisfies TemplateEntry

// --- Styles ---
const main = { backgroundColor: '#ffffff', fontFamily: "'Inter', Arial, sans-serif" }
const container = { maxWidth: '600px', margin: '0 auto' }
const header = {
  backgroundColor: 'hsl(280, 60%, 35%)',
  padding: '24px 32px',
  borderRadius: '8px 8px 0 0',
}
const headerTitle = {
  margin: '0',
  color: '#ffffff',
  fontSize: '22px',
  fontWeight: '700' as const,
  letterSpacing: '0.5px',
}
const content = { padding: '32px' }
const h1 = {
  margin: '0 0 20px',
  color: 'hsl(280, 15%, 10%)',
  fontSize: '20px',
  fontWeight: '700' as const,
}
const text = {
  fontSize: '14px',
  color: 'hsl(280, 8%, 45%)',
  lineHeight: '1.6',
  margin: '0 0 20px',
}
const detailsBox = {
  backgroundColor: 'hsl(280, 30%, 96%)',
  borderRadius: '8px',
  padding: '4px 0',
  margin: '0 0 24px',
}
const detailsTable = { width: '100%', borderCollapse: 'collapse' as const }
const labelCell = {
  padding: '10px 16px',
  color: 'hsl(280, 8%, 45%)',
  fontSize: '13px',
  borderBottom: '1px solid hsl(280, 15%, 90%)',
}
const valueCell = {
  padding: '10px 16px',
  color: 'hsl(280, 15%, 10%)',
  fontSize: '14px',
  fontWeight: '600' as const,
  textAlign: 'right' as const,
  borderBottom: '1px solid hsl(280, 15%, 90%)',
}
const buttonContainer = { textAlign: 'center' as const, margin: '0 0 20px' }
const button = {
  display: 'inline-block',
  backgroundColor: 'hsl(280, 60%, 35%)',
  color: '#ffffff',
  padding: '12px 28px',
  textDecoration: 'none',
  borderRadius: '6px',
  fontSize: '14px',
  fontWeight: '600' as const,
}
const linkFallback = {
  fontSize: '12px',
  color: 'hsl(280, 8%, 45%)',
  lineHeight: '1.5',
  margin: '0 0 20px',
}
const linkText = { color: 'hsl(280, 60%, 35%)' }
const divider = { borderColor: 'hsl(280, 15%, 90%)', margin: '0' }
const footer = { padding: '16px 32px', textAlign: 'center' as const }
const footerText = {
  fontSize: '12px',
  color: 'hsl(280, 8%, 65%)',
  margin: '0',
}
