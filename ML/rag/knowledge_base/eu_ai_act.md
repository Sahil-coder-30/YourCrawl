# EU Artificial Intelligence Act (EU AI Act)

## Title I — General Provisions

### Article 1 — Subject Matter
This Regulation lays down harmonised rules on the placing on the market, the putting into service, and the use of artificial intelligence systems ('AI systems') in the Union. It establishes prohibitions of certain AI practices, specific requirements for high-risk AI systems, harmonised transparency rules, rules on general-purpose AI models, and rules on market monitoring and governance.

### Article 2 — Scope
This Regulation applies to providers placing on the market or putting into service AI systems in the Union, irrespective of whether those providers are established within the Union or in a third country. It also applies to deployers of AI systems that are established or located within the Union, and to providers and deployers of AI systems that are established or located in a third country, where the output produced by the AI system is used in the Union.

### Article 3 — Definitions

**AI System**: A machine-based system designed to operate with varying levels of autonomy, that may exhibit adaptiveness after deployment, and that, for explicit or implicit objectives, infers, from the input it receives, how to generate outputs such as predictions, content, recommendations, or decisions that can influence physical or virtual environments.

**Provider**: A natural or legal person that develops an AI system or a general-purpose AI model, or that has an AI system or general-purpose AI model developed, and places it on the market or puts it into service under its own name or trademark.

**Deployer**: A natural or legal person that uses an AI system under its authority, except where the AI system is used in the course of a personal, non-professional activity.

**High-risk AI system**: An AI system listed in Annex III or that constitutes a safety component of a product covered by Union harmonisation legislation listed in Annex I.

## Title II — Prohibited AI Practices

### Article 5 — Prohibited AI Practices

The following AI practices are prohibited:

**(1)(a) Subliminal/Manipulative Techniques**: Placing on the market, putting into service, or using an AI system that deploys subliminal techniques beyond a person's consciousness, or purposefully manipulative or deceptive techniques, with the objective or effect of materially distorting the behaviour of a person or group of persons by appreciably impairing their ability to make an informed decision, thereby causing them significant harm.

**(1)(b) Exploitation of Vulnerabilities**: AI systems that exploit any of the vulnerabilities of a specific group of persons due to their age, disability, or a specific social or economic situation, with the objective or effect of materially distorting behaviour in a manner that causes or is reasonably likely to cause significant harm.

**(1)(c) Social Scoring**: AI systems for evaluating or classifying natural persons or groups based on social behaviour or personal characteristics, leading to detrimental treatment in social contexts unrelated to the data collection, or treatment disproportionate to their behaviour.

**(1)(d) Predictive Policing (Individual)**: AI systems for making risk assessments of natural persons to predict criminal offending solely based on profiling or personality traits (with exceptions for augmenting human assessments based on objective, verifiable facts).

**(1)(e) Facial Recognition Databases**: Creating or expanding facial recognition databases through untargeted scraping of facial images from the internet or CCTV footage.

**(1)(f) Emotion Recognition in Workplace/Education**: AI systems inferring emotions of natural persons in the areas of workplace and education institutions, except where the AI system is intended to be placed on the market or put into service for medical or safety reasons.

**(1)(g) Biometric Categorisation**: AI systems categorising natural persons individually based on biometric data to deduce or infer race, political opinions, trade union membership, religious or philosophical beliefs, sex life, or sexual orientation (with exceptions for law enforcement).

**(1)(h) Real-time Remote Biometric Identification in Public Spaces**: For the purpose of law enforcement (with strict exceptions for targeted search of victims, prevention of imminent threats, and serious criminal offences).

## Title III — High-Risk AI Systems

### Article 6 — Classification Rules for High-Risk AI Systems
An AI system is considered high-risk when it is:
(a) Intended to be used as a safety component of a product, or is itself a product, covered by EU harmonisation legislation listed in Annex I, and required to undergo third-party conformity assessment.
(b) Listed in Annex III areas including biometrics, critical infrastructure, education, employment, access to essential services, law enforcement, migration/border control, and administration of justice.

### Article 9 — Risk Management System
A risk management system shall be established, implemented, documented, and maintained for high-risk AI systems. It shall be a continuous iterative process run throughout the lifecycle, requiring regular systematic updating. It includes:
- Identification and analysis of known and reasonably foreseeable risks
- Estimation and evaluation of risks
- Adoption of suitable risk management measures
- Testing procedures

### Article 10 — Data and Data Governance
Training, validation, and testing data sets shall:
- Be subject to appropriate data governance and management practices
- Be relevant, sufficiently representative, and to the best extent possible, free of errors and complete
- Have the appropriate statistical properties, including geographic, contextual, behavioural, or functional setting

### Article 13 — Transparency and Provision of Information to Deployers
High-risk AI systems shall be designed and developed to ensure their operation is sufficiently transparent to enable deployers to interpret the output and use it appropriately. Appropriate type and degree of transparency shall be ensured, with a view to achieving compliance. Instructions for use shall include:
- Identity and contact of the provider
- Performance characteristics, limitations, and risks
- Foreseeable misuse scenarios and their consequences
- Human oversight measures

### Article 14 — Human Oversight
High-risk AI systems shall be designed and developed to be effectively overseen by natural persons during the period they are in use. Human oversight shall aim to prevent or minimise risks to health, safety, or fundamental rights.

## Title IV — Transparency Obligations for Certain AI Systems

### Article 50 — Transparency Obligations
(1) Providers shall ensure AI systems intended to interact directly with natural persons are designed so that the natural person is informed they are interacting with an AI system (unless obvious from circumstances).
(2) Providers of AI systems generating synthetic content (audio, image, video, text) shall ensure outputs are marked in a machine-readable format and detectable as artificially generated or manipulated.
(3) Deployers of emotion recognition or biometric categorisation systems shall inform the natural persons exposed.
(4) Deployers of AI systems generating deep fakes shall disclose the content is artificially generated or manipulated.

## Title V — General-Purpose AI Models

### Article 51 — Classification of General-Purpose AI Models as Systemic Risk
A general-purpose AI model shall be classified as having systemic risk if:
(a) It has high impact capabilities based on technical evaluation
(b) It is designated by the Commission based on criteria including model parameters, quality of training data, energy consumed, and downstream capabilities

### Article 53 — Obligations for Providers of General-Purpose AI Models
Providers shall:
- Draw up and keep up-to-date technical documentation
- Draw up information and documentation for downstream providers
- Put in place a copyright policy
- Publish a sufficiently detailed summary about the content used for training

## Title VIII — Penalties

### Article 99 — Penalties
- Violations of prohibited practices (Article 5): Up to €35 million or 7% of worldwide annual turnover
- Non-compliance with AI system requirements: Up to €15 million or 3% of worldwide annual turnover
- Supply of incorrect information: Up to €7.5 million or 1% of worldwide annual turnover
- For SMEs and startups, lower thresholds apply

## Dark Pattern Implications Under the EU AI Act

### Manipulative AI-Driven Interfaces
Article 5(1)(a) directly prohibits AI systems using subliminal or manipulative techniques to distort behaviour. This encompasses:
- AI-driven personalised dark patterns that adapt in real-time to exploit user psychology
- Recommendation algorithms designed to manipulate purchase decisions
- Dynamic pricing algorithms that exploit user urgency
- Personalised confirmshaming messages generated by AI

### Exploitation of Vulnerable Groups
Article 5(1)(b) prohibits exploiting vulnerabilities. Dark patterns targeting:
- Elderly users with confusing interfaces
- Children with gamification pressure
- Users in financial distress with predatory lending UX
All constitute violations.

### Transparency in AI-Powered Interfaces
Article 50 requires disclosure when users interact with AI systems. Chatbots, virtual assistants, and AI-generated content must be clearly identified. Disguised AI interactions constitute deceptive practices.

### Risk Assessment for High-Risk UX AI
If an AI system powers the UX of a high-risk application (education, employment, essential services), it must:
- Undergo risk management per Article 9
- Ensure data quality per Article 10
- Provide transparency per Article 13
- Allow human oversight per Article 14

### Deep Fakes and Synthetic Content
Article 50(4) requires disclosure of AI-generated content. Using deep fakes or synthetic testimonials in marketing without disclosure violates both the EU AI Act and consumer protection law.
