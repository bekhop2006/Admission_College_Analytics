"""Initial admin user and sample Kazakhstan universities."""

from sqlalchemy.orm import Session

from app.auth import hash_password
from app.config import settings
from app.models import Program, University, User

SAMPLE_UNIVERSITIES: list[dict] = [
    {
        "name": "Nazarbayev University",
        "city": "Astana",
        "min_ent_score": 125,
        "website": "https://nu.edu.kz",
        "description": "Международный исследовательский университет с высоким порогом ЕНТ.",
        "programs": [
            {"name": "Computer Science", "min_ent_score": 130, "grant_min_ent_score": 128},
            {"name": "Engineering", "min_ent_score": 125, "grant_min_ent_score": 122},
        ],
    },
    {
        "name": "Al-Farabi Kazakh National University",
        "city": "Almaty",
        "min_ent_score": 95,
        "website": "https://www.kaznu.kz",
        "description": "Крупнейший классический университет Казахстана.",
        "programs": [
            {"name": "Information Systems", "min_ent_score": 100, "grant_min_ent_score": 95},
            {"name": "Applied Mathematics", "min_ent_score": 98, "grant_min_ent_score": 93},
            {"name": "Law", "min_ent_score": 105, "grant_min_ent_score": 100},
        ],
    },
    {
        "name": "Satbayev University",
        "city": "Almaty",
        "min_ent_score": 85,
        "website": "https://satbayev.university",
        "description": "Технический университет: IT, инженерия, архитектура.",
        "programs": [
            {"name": "Software Engineering", "min_ent_score": 90, "grant_min_ent_score": 85},
            {"name": "Cybersecurity", "min_ent_score": 92, "grant_min_ent_score": 88},
        ],
    },
    {
        "name": "Astana IT University",
        "city": "Astana",
        "min_ent_score": 100,
        "website": "https://astanait.edu.kz",
        "description": "IT-университет в Астане, сильные программы по SE и CS.",
        "programs": [
            {"name": "Software Engineering", "min_ent_score": 105, "grant_min_ent_score": 100},
            {"name": "Data Science", "min_ent_score": 108, "grant_min_ent_score": 103},
        ],
    },
    {
        "name": "KBTU",
        "city": "Almaty",
        "min_ent_score": 90,
        "website": "https://kbtu.edu.kz",
        "description": "Казахстанско-Британский технический университет.",
        "programs": [
            {"name": "Computer Science", "min_ent_score": 95, "grant_min_ent_score": 90},
            {"name": "Finance", "min_ent_score": 92, "grant_min_ent_score": 88},
        ],
    },
    {
        "name": "Eurasian National University",
        "city": "Astana",
        "min_ent_score": 80,
        "website": "https://enu.kz",
        "description": "ЕНУ им. Л.Н. Гумилёва — широкий выбор специальностей.",
        "programs": [
            {"name": "Computer Engineering", "min_ent_score": 85, "grant_min_ent_score": 80},
            {"name": "International Relations", "min_ent_score": 88, "grant_min_ent_score": 83},
        ],
    },
    {
        "name": "Karaganda Buketov University",
        "city": "Karaganda",
        "min_ent_score": 65,
        "institution_type": "university",
        "website": "https://buketov.edu.kz",
        "description": "Региональный университет с доступным порогом ЕНТ.",
        "programs": [
            {"name": "Pedagogy", "min_ent_score": 60, "grant_min_ent_score": 55},
            {"name": "IT in Education", "min_ent_score": 70, "grant_min_ent_score": 65},
        ],
    },
    {
        "name": "Karaganda Higher Polytechnic College",
        "city": "Karaganda",
        "min_ent_score": 50,
        "institution_type": "college",
        "website": None,
        "description": "Колледж для поступления после 9–11 класса с умеренным баллом ЕНТ.",
        "programs": [
            {"name": "Programming Technician", "min_ent_score": 50, "grant_min_ent_score": None},
            {"name": "Electrical Engineering", "min_ent_score": 55, "grant_min_ent_score": None},
        ],
    },
]


def seed_database(db: Session) -> None:
    """Create default admin and sample universities when the database is empty."""
    if not db.query(User).filter(User.email == settings.admin_email).first():
        db.add(
            User(
                email=settings.admin_email,
                hashed_password=hash_password(settings.admin_password),
                full_name="RNMC Admin",
            )
        )

    if db.query(University).count() > 0:
        db.commit()
        return

    for raw in SAMPLE_UNIVERSITIES:
        item = dict(raw)
        programs_data = item.pop("programs", [])
        university = University(**item)
        db.add(university)
        db.flush()
        for program_data in programs_data:
            db.add(Program(university_id=university.id, **program_data))

    db.commit()
