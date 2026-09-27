const User = require('../models/User');
const Society = require('../models/Society');
const Builder = require('../models/Builder');
const Complaint = require('../models/Complaint');
const Notice = require('../models/Notice');
const Meeting = require('../models/Meeting');
const Document = require('../models/Document');
const RedevelopmentUpdate = require('../models/RedevelopmentUpdate');
const ActivityLog = require('../models/ActivityLog');
const RentRequest = require('../models/RentRequest');
const VacatingRequest = require('../models/VacatingRequest');
const PlatformSetting = require('../models/PlatformSetting');

const seedData = async () => {
  try {
    const userCount = await User.countDocuments();
    if (userCount > 0) {
      console.log('[Seed] Database already seeded. Skipping initial seeding.');
      return;
    }

    console.log('[Seed] Seeding realistic redevelopment demonstration data...');

    // 1. Create Super Admin
    const superAdmin = await User.create({
      name: 'Vikramaditya Singhania',
      email: 'admin@redevelopease.in',
      password: 'admin123',
      role: 'super_admin',
      accountStatus: 'approved',
      phone: '+91 98200 11223',
    });

    // 2. Create Builder Profile & Login
    const builderUser = await User.create({
      name: 'Rohan Sharma (Director)',
      email: 'builder.sharma@apexbuild.in',
      password: 'bld123',
      role: 'builder',
      accountStatus: 'approved',
      builderCompany: 'Apex Lifespaces & Infra Pvt Ltd',
      phone: '+91 98211 44556',
    });

    const builderCompany = await Builder.create({
      name: 'Rohan Sharma',
      companyName: 'Apex Lifespaces & Infra Pvt Ltd',
      email: 'builder.sharma@apexbuild.in',
      phone: '+91 98211 44556',
      reraNumber: 'P51800028192',
      experienceYears: 18,
      completedProjects: 14,
      userId: builderUser._id,
      address: '701, Pinnacle Corporate Park, BKC, Bandra East, Mumbai - 400051',
      website: 'https://apexbuild.in',
    });

    // 3. Create Society 1 (Greenview Heights CHS)
    const society1 = await Society.create({
      name: 'Greenview Heights Co-op Housing Society Ltd.',
      address: 'Plot 42, Senapati Bapat Marg, Near Shivaji Park, Dadar West',
      city: 'Mumbai',
      pincode: '400028',
      totalFlats: 120,
      establishedYear: 1986,
      registrationNumber: 'BOM/HSG/TC/10423/1986',
      societyType: 'Cooperative Housing Society (CHS)',
      createdBy: superAdmin._id,
      redevelopmentInfo: {
        builderId: builderCompany._id,
        builderUserId: builderUser._id,
        builderName: builderCompany.companyName,
        agreementDate: new Date('2024-03-15'),
        reraNumber: builderCompany.reraNumber,
        completionDate: new Date('2027-12-31'),
        status: 'RCC Construction',
        currentProgress: 68,
        carpetAreaHikePercentage: 28.5,
        hardshipCompensation: '₹ 15,00,000 per member',
        monthlyTransitRentPerSqFt: 75,
      },
    });

    // Link society to builder
    builderCompany.assignedSocieties.push(society1._id);
    await builderCompany.save();

    // 4. Create Secretary for Greenview Heights
    const secretary = await User.create({
      name: 'Rajesh Mehta',
      email: 'secretary.greenview@gmail.com',
      password: 'sec123',
      role: 'secretary',
      accountStatus: 'approved',
      societyId: society1._id,
      wing: 'A',
      flatNumber: '402',
      phone: '+91 98205 98765',
    });

    society1.secretaryId = secretary._id;
    await society1.save();

    // 5. Create Committee Member
    const committeeMember = await User.create({
      name: 'Sunita Patil',
      email: 'committee.greenview@gmail.com',
      password: 'com123',
      role: 'committee_member',
      accountStatus: 'approved',
      societyId: society1._id,
      wing: 'B',
      flatNumber: '301',
      phone: '+91 98190 22334',
    });

    // 6. Create Approved Resident
    const residentRahul = await User.create({
      name: 'Rahul Deshmukh',
      email: 'resident.rahul@gmail.com',
      password: 'res123',
      role: 'resident',
      accountStatus: 'approved',
      societyId: society1._id,
      wing: 'C',
      flatNumber: '104',
      phone: '+91 98700 55443',
    });

    // 7. Create Pending Resident (Ready for Secretary Approval Test)
    const pendingAnita = await User.create({
      name: 'Anita Sharma',
      email: 'pending.anita@gmail.com',
      password: 'res123',
      role: 'resident',
      accountStatus: 'pending',
      societyId: society1._id,
      wing: 'D',
      flatNumber: '502',
      phone: '+91 98333 77889',
    });

    // 8. Create Society 2 (Shanti Niketan CHS) for Super Admin Multi-society View
    const society2 = await Society.create({
      name: 'Shanti Niketan Co-op Housing Society',
      address: '14th Road, Khar West',
      city: 'Mumbai',
      pincode: '400052',
      totalFlats: 48,
      establishedYear: 1991,
      registrationNumber: 'BOM/HSG/TC/12984/1991',
      societyType: 'Cooperative Housing Society (CHS)',
      createdBy: superAdmin._id,
      redevelopmentInfo: {
        builderName: 'Pending Tender Selection',
        status: 'Tendering',
        currentProgress: 18,
      },
    });

    const secretary2 = await User.create({
      name: 'Kishore Kulkarni',
      email: 'secretary.shantiniketan@gmail.com',
      password: 'sec123',
      role: 'secretary',
      accountStatus: 'approved',
      societyId: society2._id,
      wing: 'A',
      flatNumber: '201',
      phone: '+91 98212 99887',
    });
    society2.secretaryId = secretary2._id;
    await society2.save();

    // 9. Create Notices for Greenview Heights
    await Notice.create([
      {
        title: 'Special General Body Meeting (SGM) on RCC Progress Review',
        content: 'Dear Members, A Special General Meeting is convened on Sunday at 10:30 AM to discuss slab casting up to the 12th floor and transit rent disbursals for Q3.',
        category: 'Meeting',
        priority: 'Important',
        isPinned: true,
        societyId: society1._id,
        createdBy: secretary._id,
      },
      {
        title: 'MahaRERA Quarterly Progress Report Q2-2026 Uploaded',
        content: 'Apex Lifespaces has formally submitted the Q2 compliance certificate. The document is accessible in the Documents section under Government clearances.',
        category: 'Redevelopment',
        priority: 'Normal',
        isPinned: false,
        societyId: society1._id,
        createdBy: secretary._id,
      },
      {
        title: 'Transit Rent Reimbursement Verification for May-June',
        content: 'All residents residing in transit accommodation are requested to ensure their rental agreements and bank passbook copies are updated for timely transfer.',
        category: 'Financial',
        priority: 'Normal',
        isPinned: false,
        societyId: society1._id,
        createdBy: secretary._id,
      },
    ]);

    // 10. Create Meetings
    await Meeting.create([
      {
        title: 'Quarterly Redevelopment Review & Member Consultation',
        agenda: '1. Review of RCC casting timeline. 2. Transit rent account audit. 3. Interior layout options for 3BHK and 2BHK units. 4. Open Q&A.',
        location: 'Society Clubhouse Temporary Office, Dadar West / Google Meet',
        date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // in 5 days
        time: '10:30 AM - 01:00 PM',
        status: 'Scheduled',
        societyId: society1._id,
        createdBy: secretary._id,
        attendeesCount: 45,
      },
      {
        title: 'Special General Body Meeting for DA Ratification',
        agenda: 'Ratification of supplementary development terms and transit rent escalation clause.',
        location: 'Dadar Club Banquet Hall, Dadar West',
        date: new Date('2025-11-20'),
        time: '11:00 AM',
        status: 'Completed',
        minutes: 'The General Body unanimously approved the supplementary escrow agreement with 98% voting in favor. Architect presentation was applauded.',
        societyId: society1._id,
        createdBy: secretary._id,
        attendeesCount: 92,
      },
    ]);

    // 11. Create Redevelopment Milestones & Updates
    await RedevelopmentUpdate.create([
      {
        societyId: society1._id,
        builderId: builderUser._id,
        title: 'Foundation Piling & Basement Raft Complete',
        description: 'Successfully cast 148 bored cast-in-situ piles and 1200mm raft foundation with ultrasonic pulse velocity concrete testing.',
        progressPercentage: 45,
        milestone: 'Substructure & Foundation',
        status: 'approved',
        approvedBy: secretary._id,
        approvalDate: new Date('2025-06-12'),
      },
      {
        societyId: society1._id,
        builderId: builderUser._id,
        title: 'Podium Parking & 4th Floor Slab Cast',
        description: 'Two-tier mechanized car parking podium and commercial front facade structure finished with cured M40 grade concrete.',
        progressPercentage: 58,
        milestone: 'Podium & Lower Residential Slabs',
        status: 'approved',
        approvedBy: secretary._id,
        approvalDate: new Date('2025-10-18'),
      },
      {
        societyId: society1._id,
        builderId: builderUser._id,
        title: 'RCC Frame Completed up to 8th Floor Slab',
        description: 'Structural frame for 8th floor finished. Plastering and brickwork initiated on floors 1 through 4.',
        progressPercentage: 68,
        milestone: 'RCC Structure Mid-Rise',
        status: 'approved',
        approvedBy: secretary._id,
        approvalDate: new Date('2026-02-10'),
      },
      {
        societyId: society1._id,
        builderId: builderUser._id,
        title: '11th Floor Slab Ready for Inspection & Pouring',
        description: 'Shuttering, reinforcement steel mesh, and MEP conduit conduits laid for 11th floor slab. Awaiting Society Architect inspection.',
        progressPercentage: 75,
        milestone: 'RCC Structure 11th Floor',
        status: 'pending_approval', // Testing approval workflow by Secretary!
      },
    ]);

    // 12. Create Document Repository
    await Document.create([
      {
        title: 'Registered Development Agreement (DA) & Power of Attorney',
        category: 'Legal',
        fileUrl: '/uploads/sample-legal-agreement.pdf',
        fileName: 'Greenview_Registered_DA_2024.pdf',
        fileSize: '4.8 MB',
        fileType: 'pdf',
        societyId: society1._id,
        uploadedBy: secretary._id,
        accessRole: ['secretary', 'committee_member', 'resident', 'builder', 'super_admin'],
        description: 'Fully executed and registered tri-partite redevelopment agreement registered with Sub-Registrar Dadar.',
      },
      {
        title: 'Approved Architectural 3D Elevation & Floor Layout Plans',
        category: 'Architectural',
        fileUrl: '/uploads/sample-architectural-plans.pdf',
        fileName: 'Architectural_Master_Plan_3D.pdf',
        fileSize: '12.4 MB',
        fileType: 'pdf',
        societyId: society1._id,
        uploadedBy: builderUser._id,
        accessRole: ['secretary', 'committee_member', 'resident', 'builder', 'super_admin'],
        description: 'MCGM approved floor blueprints, parking layout, and 2BHK/3BHK typical unit diagrams.',
      },
      {
        title: 'MahaRERA Registration Certificate & Commencement Certificate (CC)',
        category: 'Government',
        fileUrl: '/uploads/sample-government-cc.pdf',
        fileName: 'MahaRERA_Certificate_P51800028192.pdf',
        fileSize: '2.1 MB',
        fileType: 'pdf',
        societyId: society1._id,
        uploadedBy: builderUser._id,
        accessRole: ['secretary', 'committee_member', 'resident', 'builder', 'super_admin'],
        description: 'Official commencement certificate issued by MCGM Building Proposal Department up to 18 floors.',
      },
      {
        title: 'Transit Rent Escrow Bank Guarantee Letter',
        category: 'Finance',
        fileUrl: '/uploads/sample-finance-guarantee.pdf',
        fileName: 'HDFC_Bank_Guarantee_Escrow_2025.pdf',
        fileSize: '1.9 MB',
        fileType: 'pdf',
        societyId: society1._id,
        uploadedBy: secretary._id,
        accessRole: ['secretary', 'committee_member', 'resident'],
        description: 'Bank guarantee covering 24 months of transit rent commitment deposited by Apex Lifespaces.',
      },
      {
        title: 'Structural Stability & Concrete Cube Test Report (8th Floor)',
        category: 'Builder',
        fileUrl: '/uploads/sample-builder-testing.pdf',
        fileName: 'Cube_Test_Report_M40_Grade.pdf',
        fileSize: '3.2 MB',
        fileType: 'pdf',
        societyId: society1._id,
        uploadedBy: builderUser._id,
        accessRole: ['secretary', 'committee_member', 'builder'],
        description: 'Independent third-party laboratory compressive strength test certificates.',
      },
    ]);

    // 13. Create Complaints
    await Complaint.create([
      {
        title: 'Transit Rent Payment Delayed for May Month',
        description: 'Transit rent for Flat C-104 has not credited into my HDFC account despite agreement submission.',
        category: 'Transit Rent',
        priority: 'High',
        status: 'In Progress',
        residentId: residentRahul._id,
        societyId: society1._id,
        assignedTo: secretary._id,
        resolutionNotes: 'Disbursement batch cleared by builder account team. Transfer reference shared with member.',
      },
      {
        title: 'Request for Revision in Kitchen Window Location (Wing C)',
        description: 'Regarding typical 2BHK layout, requesting whether the kitchen utility balcony can be enclosed as per MCGM policy.',
        category: 'Redevelopment',
        priority: 'Medium',
        status: 'Open',
        residentId: residentRahul._id,
        societyId: society1._id,
      },
      {
        title: 'Water Seepage during Pre-Monsoon Basement Waterproofing',
        description: 'Minor water collection observed at north boundary wall near generator pad.',
        category: 'Maintenance',
        priority: 'Urgent',
        status: 'Resolved',
        residentId: committeeMember._id,
        societyId: society1._id,
        assignedTo: secretary._id,
        resolutionNotes: 'Apex Lifespaces site engineer grouted the joint and applied 3-coat bituminous waterproofing membrane.',
      },
    ]);

    // 14. Create Rent & Vacating Requests
    await RentRequest.create({
      societyId: society1._id,
      residentId: residentRahul._id,
      flatNumber: '104',
      wing: 'C',
      monthlyAmount: 48000,
      bankDetails: {
        accountHolderName: 'Rahul Deshmukh',
        bankName: 'HDFC Bank Ltd',
        accountNumber: '50100239481920',
        ifscCode: 'HDFC0000084',
      },
      rentalAgreementUrl: '/uploads/sample-rental-agreement.pdf',
      status: 'Approved',
      disbursedMonths: ['January 2026', 'February 2026', 'March 2026'],
      remarks: 'Transit accommodation near Shivaji Park verified.',
    });

    await VacatingRequest.create({
      societyId: society1._id,
      residentId: residentRahul._id,
      flatNumber: '104',
      wing: 'C',
      plannedDate: new Date('2024-04-10'),
      status: 'Completed',
      electricityMeterReading: '84920 kWh',
      gasMeterReading: '412 units',
      remarks: 'Keys handed over to Society Secretary and site manager. No dues certificate cleared.',
    });

    // 15. Create Audit Activity Logs
    await ActivityLog.create([
      {
        societyId: society1._id,
        userId: superAdmin._id,
        action: 'Platform Setup & Society Onboarding',
        details: 'Initial registration of Greenview Heights CHS and Secretary account',
      },
      {
        societyId: society1._id,
        userId: secretary._id,
        action: 'Resident Approved',
        details: 'Approved resident Rahul Deshmukh (Wing C, Flat 104)',
      },
      {
        societyId: society1._id,
        userId: builderUser._id,
        action: 'Milestone Progress Uploaded',
        details: 'Uploaded 8th floor RCC milestone (68% overall)',
      },
    ]);

    // 16. Create Default Platform Settings
    await PlatformSetting.create({
      appName: 'RedevelopEase',
      maintenanceMode: false,
      allowPublicRegistration: true,
      systemEmail: 'admin@redevelopease.in',
      supportContact: '+91 22 4567 8900',
      announcementBanner: 'Welcome to RedevelopEase 2.0 - Digitizing Society Redevelopment Across Maharashtra',
    });

    console.log('[Seed] Seeding completed successfully!');
  } catch (err) {
    console.error('[Seed Error]', err);
  }
};

module.exports = { seedData };
