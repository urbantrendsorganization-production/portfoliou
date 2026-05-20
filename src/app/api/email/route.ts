import { Resend } from "resend";
import { NextRequest, NextResponse } from "next/server";

const resend = new Resend(process.env.RESEND_API_KEY);

const FROM = "PortfolioU <onboarding@resend.dev>";
const ADMIN_EMAIL = "muchemiedwin68@gmail.com";
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

export async function POST(req: NextRequest) {
  try {
    const { type, payload } = await req.json();

    if (type === "contact") {
      const { name, email, subject, message } = payload as {
        name: string;
        email: string;
        subject: string;
        message: string;
      };

      await resend.emails.send({
        from: FROM,
        to: [ADMIN_EMAIL],
        replyTo: email,
        subject: `[Contact] ${subject}`,
        html: `
          <div style="font-family:sans-serif;max-width:600px;margin:0 auto">
            <div style="background:#4f46e5;padding:32px 24px;border-radius:12px 12px 0 0">
              <h1 style="color:white;margin:0;font-size:24px">New Contact Message</h1>
            </div>
            <div style="background:#ffffff;padding:24px;border:1px solid #e5e7eb;border-top:none;border-radius:0 0 12px 12px">
              <table style="width:100%;border-collapse:collapse;margin-bottom:24px">
                <tr><td style="padding:8px 0;color:#6b7280;font-size:14px;width:80px">From</td><td style="padding:8px 0;color:#111827;font-weight:600">${name}</td></tr>
                <tr><td style="padding:8px 0;color:#6b7280;font-size:14px">Email</td><td style="padding:8px 0;color:#4f46e5"><a href="mailto:${email}" style="color:#4f46e5">${email}</a></td></tr>
                <tr><td style="padding:8px 0;color:#6b7280;font-size:14px">Subject</td><td style="padding:8px 0;color:#111827">${subject}</td></tr>
              </table>
              <hr style="border:none;border-top:1px solid #e5e7eb;margin:16px 0" />
              <h3 style="color:#374151;margin-top:0">Message</h3>
              <p style="color:#4b5563;line-height:1.6;white-space:pre-wrap">${message}</p>
            </div>
          </div>
        `,
      });

      // Auto-reply to sender
      await resend.emails.send({
        from: FROM,
        to: [email],
        subject: "We received your message — PortfolioU",
        html: `
          <div style="font-family:sans-serif;max-width:600px;margin:0 auto">
            <div style="background:#4f46e5;padding:32px 24px;border-radius:12px 12px 0 0">
              <h1 style="color:white;margin:0;font-size:24px">Thanks, ${name}!</h1>
            </div>
            <div style="background:#ffffff;padding:24px;border:1px solid #e5e7eb;border-top:none;border-radius:0 0 12px 12px">
              <p style="color:#4b5563;line-height:1.6">We received your message and will get back to you within 1–2 business days.</p>
              <p style="color:#4b5563;line-height:1.6">In the meantime, feel free to explore the platform:</p>
              <a href="${APP_URL}/browse" style="display:inline-block;background:#4f46e5;color:white;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:600;margin-top:8px">Browse Talent</a>
              <hr style="border:none;border-top:1px solid #e5e7eb;margin:24px 0" />
              <p style="color:#9ca3af;font-size:13px;margin:0">PortfolioU — Talent Marketplace for College Creatives</p>
            </div>
          </div>
        `,
      });

      return NextResponse.json({ success: true });
    }

    if (type === "welcome") {
      const { name, email, role } = payload as {
        name: string;
        email: string;
        role: "student" | "client";
      };

      const isCreator = role === "student";

      await resend.emails.send({
        from: FROM,
        to: [email],
        subject: `Welcome to PortfolioU, ${name}!`,
        html: `
          <div style="font-family:sans-serif;max-width:600px;margin:0 auto">
            <div style="background:linear-gradient(135deg,#4f46e5,#7c3aed);padding:48px 24px;border-radius:12px 12px 0 0;text-align:center">
              <h1 style="color:white;margin:0;font-size:32px;font-weight:800">Welcome to PortfolioU!</h1>
              <p style="color:rgba(255,255,255,0.85);margin-top:8px">Your ${isCreator ? "creator" : "business"} account is ready</p>
            </div>
            <div style="background:#ffffff;padding:32px 24px;border:1px solid #e5e7eb;border-top:none">
              <p style="color:#374151;font-size:16px;line-height:1.6">Hi <strong>${name}</strong>,</p>
              <p style="color:#4b5563;line-height:1.6">
                ${isCreator
                  ? "You're now part of a growing community of college creatives. Build your portfolio, get discovered by top brands, and land paid gigs."
                  : "Your business account is live. Start browsing verified creative talent from Kenya's top colleges — from beauty to web development to graphic design and fashion."
                }
              </p>
              <div style="background:#f5f3ff;border-radius:12px;padding:20px;margin:24px 0">
                <h3 style="color:#4f46e5;margin:0 0 12px">Get started:</h3>
                <ul style="margin:0;padding-left:20px;color:#4b5563;line-height:1.8">
                  ${isCreator
                    ? "<li>Upload your first work sample</li><li>Complete your profile</li><li>Share your portfolio link</li><li>Browse open gigs</li>"
                    : "<li>Browse creative talent by discipline</li><li>Bookmark top profiles</li><li>Post your first gig</li><li>Message candidates directly</li>"
                  }
                </ul>
              </div>
              <a href="${APP_URL}/dashboard" style="display:inline-block;background:#4f46e5;color:white;padding:14px 28px;border-radius:8px;text-decoration:none;font-weight:700;font-size:16px">Go to Dashboard →</a>
            </div>
            <div style="background:#f9fafb;padding:20px 24px;border:1px solid #e5e7eb;border-top:none;border-radius:0 0 12px 12px">
              <p style="color:#9ca3af;font-size:13px;margin:0">PortfolioU · Nairobi, Kenya · <a href="${APP_URL}" style="color:#6b7280">portfoliou.urbantrends.dev</a></p>
            </div>
          </div>
        `,
      });

      return NextResponse.json({ success: true });
    }

    if (type === "gig_application") {
      const { clientEmail, clientName, studentName, studentPortfolio, gigTitle, message } = payload as {
        clientEmail: string;
        clientName: string;
        studentName: string;
        studentPortfolio: string;
        gigTitle: string;
        message: string;
      };

      await resend.emails.send({
        from: FROM,
        to: [clientEmail],
        subject: `New Application for "${gigTitle}" — PortfolioU`,
        html: `
          <div style="font-family:sans-serif;max-width:600px;margin:0 auto">
            <div style="background:#4f46e5;padding:32px 24px;border-radius:12px 12px 0 0">
              <h1 style="color:white;margin:0;font-size:22px">New Gig Application</h1>
              <p style="color:rgba(255,255,255,0.8);margin:8px 0 0">${gigTitle}</p>
            </div>
            <div style="background:#ffffff;padding:24px;border:1px solid #e5e7eb;border-top:none;border-radius:0 0 12px 12px">
              <p style="color:#374151">Hi <strong>${clientName}</strong>,</p>
              <p style="color:#4b5563;line-height:1.6"><strong>${studentName}</strong> has applied for your gig.</p>
              <div style="background:#f5f3ff;border-radius:8px;padding:16px;margin:16px 0">
                <p style="margin:0;color:#4b5563;line-height:1.6;font-style:italic">"${message}"</p>
              </div>
              <a href="${studentPortfolio}" style="display:inline-block;background:#4f46e5;color:white;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:600;margin-top:8px">View Portfolio →</a>
              <a href="${APP_URL}/gigs" style="display:inline-block;background:#f3f4f6;color:#374151;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:600;margin-top:8px;margin-left:8px">Manage Applications</a>
            </div>
          </div>
        `,
      });

      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: "Unknown email type" }, { status: 400 });
  } catch (err: any) {
    console.error("Email send error:", err);
    return NextResponse.json({ error: err.message || "Failed to send email" }, { status: 500 });
  }
}
