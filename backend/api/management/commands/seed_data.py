"""
Management command to seed PortfolioU with realistic demo data.

Usage:
    cd backend
    python manage.py seed_data          # seed everything
    python manage.py seed_data --clear  # clear existing seed data first
"""

from django.core.management.base import BaseCommand
from django.contrib.auth.models import User
from api.models import Profile, Gig, College
from datetime import datetime, timezone, timedelta


STUDENT_SEED = [
    {
        "username": "amara_diallo",
        "email": "amara@demo.portfoliou.dev",
        "password": "demo1234",
        "profile": {
            "name": "Amara Diallo",
            "role": "student",
            "discipline": "Beauty & Cosmetology",
            "school": "University of Nairobi",
            "location": "Nairobi, Kenya",
            "bio": "Hair artist and makeup specialist focused on natural African styles and bridal looks. Available for events and editorial shoots.",
            "skills": ["Hair Styling", "Bridal Makeup", "Natural Hair", "Nail Art"],
            "open_to_work": True,
        },
    },
    {
        "username": "kevin_ochieng",
        "email": "kevin@demo.portfoliou.dev",
        "password": "demo1234",
        "profile": {
            "name": "Kevin Ochieng",
            "role": "student",
            "discipline": "Web/App Development",
            "school": "Strathmore University",
            "location": "Nairobi, Kenya",
            "bio": "Full-stack developer building clean, fast web apps. Passionate about fintech and e-commerce solutions for African markets.",
            "skills": ["React", "Node.js", "Django", "PostgreSQL", "UI Design"],
            "open_to_work": True,
            "is_premium": True,
        },
    },
    {
        "username": "fatima_alhassan",
        "email": "fatima@demo.portfoliou.dev",
        "password": "demo1234",
        "profile": {
            "name": "Fatima Al-Hassan",
            "role": "student",
            "discipline": "Graphic Design",
            "school": "USIU Africa",
            "location": "Nairobi, Kenya",
            "bio": "Brand identity designer specialising in vibrant, culturally-rooted visual systems for African businesses and startups.",
            "skills": ["Brand Identity", "Illustrator", "Figma", "Motion Graphics"],
            "open_to_work": True,
        },
    },
    {
        "username": "daniel_kamau",
        "email": "daniel@demo.portfoliou.dev",
        "password": "demo1234",
        "profile": {
            "name": "Daniel Kamau",
            "role": "student",
            "discipline": "Fashion & Styling",
            "school": "Kenya Institute of Fashion Design",
            "location": "Nairobi, Kenya",
            "bio": "Fashion designer and personal stylist with a focus on sustainable, locally-sourced fabrics and Afro-contemporary aesthetics.",
            "skills": ["Fashion Design", "Personal Styling", "Textile Sourcing", "Lookbook"],
            "open_to_work": True,
        },
    },
    {
        "username": "aisha_mwangi",
        "email": "aisha@demo.portfoliou.dev",
        "password": "demo1234",
        "profile": {
            "name": "Aisha Mwangi",
            "role": "student",
            "discipline": "Beauty & Cosmetology",
            "school": "Kenyatta University",
            "location": "Thika, Kenya",
            "bio": "Certified cosmetologist specialising in protective styles, locs, and advanced skincare treatments.",
            "skills": ["Protective Styles", "Locs", "Skincare", "Wigs", "Colour"],
            "open_to_work": False,
        },
    },
    {
        "username": "brian_otieno",
        "email": "brian@demo.portfoliou.dev",
        "password": "demo1234",
        "profile": {
            "name": "Brian Otieno",
            "role": "student",
            "discipline": "Web/App Development",
            "school": "Jomo Kenyatta University",
            "location": "Nairobi, Kenya",
            "bio": "Mobile-first developer. I build Android and cross-platform apps that solve everyday problems for East African consumers.",
            "skills": ["Flutter", "Kotlin", "Firebase", "REST APIs", "UX Design"],
            "open_to_work": True,
        },
    },
    {
        "username": "zara_njeri",
        "email": "zara@demo.portfoliou.dev",
        "password": "demo1234",
        "profile": {
            "name": "Zara Njeri",
            "role": "student",
            "discipline": "Graphic Design",
            "school": "Daystar University",
            "location": "Nairobi, Kenya",
            "bio": "Illustrator and social-media designer. I help small businesses build a consistent, scroll-stopping visual presence.",
            "skills": ["Illustration", "Canva Pro", "Photoshop", "Social Media Graphics"],
            "open_to_work": True,
            "is_premium": True,
        },
    },
    {
        "username": "marcus_wafula",
        "email": "marcus@demo.portfoliou.dev",
        "password": "demo1234",
        "profile": {
            "name": "Marcus Wafula",
            "role": "student",
            "discipline": "Fashion & Styling",
            "school": "Technical University of Mombasa",
            "location": "Mombasa, Kenya",
            "bio": "Wardrobe stylist and fashion photographer. I create editorial looks that blend coastal Swahili culture with modern streetwear.",
            "skills": ["Wardrobe Styling", "Editorial Shoots", "Streetwear", "Fashion Photography"],
            "open_to_work": True,
        },
    },
    {
        "username": "priya_sharma",
        "email": "priya@demo.portfoliou.dev",
        "password": "demo1234",
        "profile": {
            "name": "Priya Sharma",
            "role": "student",
            "discipline": "Web/App Development",
            "school": "Aga Khan University",
            "location": "Nairobi, Kenya",
            "bio": "UI/UX designer and front-end developer. I craft user-centric interfaces that are both beautiful and accessible.",
            "skills": ["Figma", "React", "Tailwind CSS", "User Research", "Prototyping"],
            "open_to_work": True,
        },
    },
    {
        "username": "naledi_dube",
        "email": "naledi@demo.portfoliou.dev",
        "password": "demo1234",
        "profile": {
            "name": "Naledi Dube",
            "role": "student",
            "discipline": "Graphic Design",
            "school": "Nairobi Design Institute",
            "location": "Nairobi, Kenya",
            "bio": "Typographer and print designer specialising in packaging, event branding, and publication layouts.",
            "skills": ["Typography", "InDesign", "Packaging Design", "Print", "Branding"],
            "open_to_work": False,
            "is_premium": True,
        },
    },
]

CLIENT_SEED = [
    {
        "username": "techbridge_ke",
        "email": "client1@demo.portfoliou.dev",
        "password": "demo1234",
        "profile": {"name": "TechBridge Kenya", "role": "client"},
        "gigs": [
            {
                "title": "Logo Design for Nairobi Tech Startup",
                "discipline": "Graphic Design",
                "description": "We need a modern, clean logo for our fintech startup. Must convey trust and innovation. Deliverables: primary logo, icon, color palette, and brand guide.",
                "budget": "KES 8,000 – 15,000",
                "deadline_days": 33,
            },
            {
                "title": "Social Media Graphics for 3 Months",
                "discipline": "Graphic Design",
                "description": "Looking for a graphic designer to create 12 social media posts per month (Instagram + Facebook). Posts should follow our brand guide. Monthly retainer.",
                "budget": "KES 10,000/month",
                "deadline_days": 63,
            },
        ],
    },
    {
        "username": "nyama_choma_house",
        "email": "client2@demo.portfoliou.dev",
        "password": "demo1234",
        "profile": {"name": "Nyama Choma House", "role": "client"},
        "gigs": [
            {
                "title": "Website Redesign for Nairobi Restaurant",
                "discipline": "Web/App Development",
                "description": "Our restaurant website is outdated. We need a new responsive site with an online menu, booking form, and gallery. Mobile-first design is a must.",
                "budget": "KES 20,000 – 35,000",
                "deadline_days": 38,
            },
        ],
    },
    {
        "username": "vivid_collective",
        "email": "client3@demo.portfoliou.dev",
        "password": "demo1234",
        "profile": {"name": "Vivid Collective", "role": "client"},
        "gigs": [
            {
                "title": "Campaign Styling for Fashion Lookbook",
                "discipline": "Fashion & Styling",
                "description": "Seeking a creative stylist for a 1-day editorial fashion shoot. We will supply 6 outfits and a photographer. Need someone who can style models and arrange creative compositions.",
                "budget": "KES 12,000",
                "deadline_days": 28,
            },
            {
                "title": "Hair Styling for Fashion Show",
                "discipline": "Beauty & Cosmetology",
                "description": "Annual student fashion show needs 2 hair stylists for backstage. You will work with 12 models over 3 hours. Theme is Afro-Futurist.",
                "budget": "KES 8,000 per stylist",
                "deadline_days": 45,
            },
        ],
    },
    {
        "username": "jua_coffee",
        "email": "client4@demo.portfoliou.dev",
        "password": "demo1234",
        "profile": {"name": "Jua Coffee Co.", "role": "client"},
        "gigs": [
            {
                "title": "Brand Identity Package for Coffee Shop",
                "discipline": "Graphic Design",
                "description": "New specialty coffee shop opening in Westlands needs full brand identity: logo, colour palette, typography, packaging stickers, and social media templates.",
                "budget": "KES 25,000 – 40,000",
                "deadline_days": 50,
            },
        ],
    },
    {
        "username": "rushroute_ltd",
        "email": "client5@demo.portfoliou.dev",
        "password": "demo1234",
        "profile": {"name": "RushRoute Ltd.", "role": "client"},
        "gigs": [
            {
                "title": "Mobile App UI for Delivery Service",
                "discipline": "Web/App Development",
                "description": "We are building a last-mile delivery app for Nairobi. Need a UI/UX designer to create polished Figma screens for the rider and customer apps. 20 screens total.",
                "budget": "KES 30,000 – 50,000",
                "deadline_days": 58,
            },
        ],
    },
]


COLLEGE_SEED = [
    {"name": "University of Nairobi", "short_name": "UoN", "location": "Nairobi, Kenya", "website": "https://www.uonbi.ac.ke"},
    {"name": "Strathmore University", "short_name": "SU", "location": "Nairobi, Kenya", "website": "https://www.strathmore.edu"},
    {"name": "USIU-Africa", "short_name": "USIU", "location": "Nairobi, Kenya", "website": "https://www.usiu.ac.ke"},
    {"name": "Kenyatta University", "short_name": "KU", "location": "Nairobi, Kenya", "website": "https://www.ku.ac.ke"},
    {"name": "Jomo Kenyatta University of Agriculture and Technology", "short_name": "JKUAT", "location": "Juja, Kenya", "website": "https://www.jkuat.ac.ke"},
    {"name": "Daystar University", "short_name": "DU", "location": "Nairobi, Kenya", "website": "https://www.daystar.ac.ke"},
    {"name": "Moi University", "short_name": "MU", "location": "Eldoret, Kenya", "website": "https://www.mu.ac.ke"},
    {"name": "Technical University of Mombasa", "short_name": "TUM", "location": "Mombasa, Kenya", "website": "https://www.tum.ac.ke"},
    {"name": "Aga Khan University", "short_name": "AKU", "location": "Nairobi, Kenya", "website": "https://www.aku.edu"},
    {"name": "Multimedia University of Kenya", "short_name": "MMU", "location": "Nairobi, Kenya", "website": "https://www.mmu.ac.ke"},
    {"name": "Nairobi Design Institute", "short_name": "NDI", "location": "Nairobi, Kenya", "website": ""},
    {"name": "Kenya Institute of Fashion Design", "short_name": "KIFD", "location": "Nairobi, Kenya", "website": ""},
    {"name": "Mount Kenya University", "short_name": "MKU", "location": "Thika, Kenya", "website": "https://www.mku.ac.ke"},
    {"name": "United States International University Africa", "short_name": "USIU-A", "location": "Nairobi, Kenya", "website": "https://www.usiu.ac.ke"},
    {"name": "Riara University", "short_name": "RU", "location": "Nairobi, Kenya", "website": "https://www.riarauniversity.ac.ke"},
]


class Command(BaseCommand):
    help = "Seed the database with realistic demo profiles and gigs for PortfolioU."

    def add_arguments(self, parser):
        parser.add_argument(
            "--clear",
            action="store_true",
            help="Delete existing seed data before re-seeding (identifies seeds by @demo.portfoliou.dev email).",
        )

    def handle(self, *args, **options):
        if options["clear"]:
            deleted, _ = User.objects.filter(email__endswith="@demo.portfoliou.dev").delete()
            self.stdout.write(self.style.WARNING(f"Cleared {deleted} existing seed users."))

        created_colleges = 0
        for c in COLLEGE_SEED:
            college, created = College.objects.get_or_create(
                name=c["name"],
                defaults={
                    "short_name": c.get("short_name", ""),
                    "location": c.get("location", ""),
                    "website": c.get("website", ""),
                    "is_active": True,
                },
            )
            if created:
                created_colleges += 1
        self.stdout.write(self.style.SUCCESS(f"Seeded {created_colleges} new colleges ({College.objects.count()} total in DB)."))

        created_students = 0
        for seed in STUDENT_SEED:
            user, created = User.objects.get_or_create(
                username=seed["username"],
                defaults={"email": seed["email"]},
            )
            if created:
                user.set_password(seed["password"])
                user.save()
                created_students += 1

            p = user.profile
            pdata = seed["profile"]
            p.name = pdata["name"]
            p.role = pdata["role"]
            p.discipline = pdata.get("discipline", "")
            p.location = pdata.get("location", "")
            p.bio = pdata.get("bio", "")
            p.skills = pdata.get("skills", [])
            p.open_to_work = pdata.get("open_to_work", False)
            p.is_premium = pdata.get("is_premium", False)
            school_name = pdata.get("school", "")
            if school_name:
                try:
                    p.college = College.objects.get(name=school_name)
                except College.DoesNotExist:
                    p.college = None
            p.school = school_name
            p.username = seed["username"]
            p.save()

        self.stdout.write(self.style.SUCCESS(f"Seeded {created_students} new student accounts ({len(STUDENT_SEED)} total students in DB)."))

        created_clients = 0
        created_gigs = 0
        now = datetime.now(tz=timezone.utc)

        for seed in CLIENT_SEED:
            user, created = User.objects.get_or_create(
                username=seed["username"],
                defaults={"email": seed["email"]},
            )
            if created:
                user.set_password(seed["password"])
                user.save()
                created_clients += 1

            p = user.profile
            pdata = seed["profile"]
            p.name = pdata["name"]
            p.role = pdata["role"]
            p.username = seed["username"]
            p.save()

            for gig_data in seed.get("gigs", []):
                gig, gig_created = Gig.objects.get_or_create(
                    title=gig_data["title"],
                    client_profile=p,
                    defaults={
                        "discipline": gig_data["discipline"],
                        "description": gig_data["description"],
                        "budget": gig_data["budget"],
                        "deadline": now + timedelta(days=gig_data["deadline_days"]),
                        "status": "open",
                    },
                )
                if gig_created:
                    created_gigs += 1

        self.stdout.write(self.style.SUCCESS(
            f"Seeded {created_clients} new client accounts ({len(CLIENT_SEED)} total clients in DB)."
        ))
        self.stdout.write(self.style.SUCCESS(f"Seeded {created_gigs} new gigs."))
        self.stdout.write(self.style.SUCCESS("\nDone! Run the dev server and visit /browse or /gigs to verify."))
