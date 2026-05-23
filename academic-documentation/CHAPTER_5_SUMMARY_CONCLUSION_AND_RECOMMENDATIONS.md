# CHAPTER FIVE — SUMMARY, CONCLUSIONS AND RECOMMENDATIONS

## 5.1 Summary

This study addressed fragmented SRC governance at Knutsford University by designing and implementing an NFC-based student permit verification and governance management system. The methodology combined requirements analysis, object-oriented design, Laravel implementation, mobile API development, and Pest feature testing.

The system delivers an operations dashboard, public portal, and Expo mobile application connected to a shared Laravel backend. Key findings from implementation and testing include successful permit issuance and verification, Paystack payment confirmation before completion, NFC registration with hashed identifiers, election voting with eligibility enforcement, role-based access control, and audit logging for sensitive actions.

## 5.2 Conclusions

The project objectives were achieved. The platform centralizes permits, payments, verification, elections, and communication. NFC verification reduces manual lookup time when devices and cards are available. Server-side payment verification avoids relying on client redirects alone. Mobile access extends services beyond the desktop dashboard.

The findings confirm that integrated governance software is feasible for SRC operations, although institutional adoption still depends on training, policy alignment, and production deployment.

## 5.3 What Is New

The study contributes a single platform that combines SRC permit lifecycle management, Paystack verification, NFC-assisted verification with fallbacks, controlled elections, public communication, and operational reporting for Knutsford University. Existing comparators typically cover elections or attendance alone.

## 5.4 Contribution and Reflection

The work gives the SRC a structured digital record of permits, payments, verification events, and votes. Stakeholders can review audit logs and reports instead of reconstructing events from paper files. Testing results were generally positive, but offline NFC verification and full integration with the university student information system remain future improvements.

## 5.5 Recommendations

1. Deploy the system on secured infrastructure with queue workers and monitoring.
2. Train executives, staff, and students on permit requests, verification, and elections.
3. Align SRC policy with digital permit and voting rules.
4. Add offline verification caching for low-connectivity events.
5. Integrate with the official student information system when APIs become available.
6. Expand analytics for permit expiry and payment recovery trends.
