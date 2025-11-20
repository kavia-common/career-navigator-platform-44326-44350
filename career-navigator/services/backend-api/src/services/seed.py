from typing import Dict

from sqlalchemy.orm import Session

from ..models.models import Role, Skill, RoleSkill


def _get_role_seed_data() -> Dict[str, Dict[str, int]]:
    """Return role -> {skill_name: level_required} mapping with 15 roles and 10–20 skills each."""
    common_skills = {
        "Python": 3,
        "JavaScript": 3,
        "System Design": 3,
        "Databases": 3,
        "APIs": 3,
        "Cloud (AWS/GCP/Azure)": 3,
        "CI/CD": 3,
        "Testing": 3,
        "Security Basics": 2,
        "Agile Practices": 2,
    }

    roles: Dict[str, Dict[str, int]] = {
        "Senior Engineer": {
            **common_skills,
            "Code Review": 3,
            "Mentoring": 2,
            "Observability": 2,
            "Performance Tuning": 3,
        },
        "Staff Engineer": {
            **common_skills,
            "Architecture": 4,
            "Cross-team Collaboration": 4,
            "Tech Strategy": 3,
            "Incident Management": 3,
        },
        "Principal Engineer": {
            **common_skills,
            "Architecture": 5,
            "Tech Strategy": 4,
            "Scaling Systems": 4,
            "Influence": 4,
        },
        "Engineering Manager": {
            "People Management": 4,
            "Hiring": 3,
            "Delivery Management": 4,
            "Agile Practices": 3,
            "Stakeholder Management": 4,
            "Project Planning": 3,
            "Technical Literacy": 3,
            "Budgeting Basics": 2,
            "Performance Management": 3,
            "Mentoring": 3,
        },
        "Senior EM": {
            "People Management": 5,
            "Hiring": 4,
            "Delivery Management": 5,
            "Org Design": 4,
            "Stakeholder Management": 5,
            "Program Management": 4,
            "Technical Literacy": 3,
            "Coaching": 4,
            "Roadmapping": 4,
            "Risk Management": 4,
        },
        "Director of Engineering": {
            "Org Design": 5,
            "Budgeting": 4,
            "Portfolio Management": 4,
            "Tech Strategy": 4,
            "Executive Communication": 4,
            "Hiring": 4,
            "Delivery Management": 5,
            "Quality Governance": 4,
            "Incident Management": 3,
            "Vendor Management": 3,
        },
        "VP Engineering": {
            "Tech Strategy": 5,
            "Executive Communication": 5,
            "Org Design": 5,
            "Financial Planning": 4,
            "Governance": 4,
            "Risk Management": 4,
            "Talent Strategy": 4,
            "Platform Strategy": 4,
            "Change Management": 4,
            "Security & Compliance": 4,
        },
        "CTO": {
            "Vision & Strategy": 5,
            "Executive Communication": 5,
            "Investor Communication": 4,
            "Org Design": 5,
            "Platform Strategy": 5,
            "Security & Compliance": 4,
            "Technology Forecasting": 4,
            "M&A Due Diligence": 3,
            "Budgeting": 4,
            "Public Speaking": 4,
        },
        "Chief Architect": {
            "Architecture": 5,
            "System Design": 5,
            "Platform Strategy": 4,
            "API Strategy": 4,
            "Data Architecture": 4,
            "Scalability": 5,
            "Reliability": 5,
            "Security Architecture": 4,
            "Cloud (AWS/GCP/Azure)": 4,
            "Observability": 4,
        },
        "Solutions Architect": {
            "Pre-sales": 4,
            "Client Discovery": 4,
            "Solution Design": 4,
            "Cloud (AWS/GCP/Azure)": 4,
            "APIs": 4,
            "Integration": 4,
            "Security Basics": 3,
            "Estimation": 3,
            "Presentation": 4,
            "Documentation": 4,
        },
        "Product Manager": {
            "Product Discovery": 4,
            "Roadmapping": 4,
            "Stakeholder Management": 4,
            "User Research": 4,
            "Data Analysis": 3,
            "Backlog Management": 4,
            "Go-to-market": 3,
            "KPIs": 4,
            "A/B Testing": 3,
            "Communication": 4,
        },
        "Program Manager": {
            "Program Management": 5,
            "Risk Management": 4,
            "Stakeholder Management": 4,
            "Budgeting": 3,
            "Cross-team Coordination": 4,
            "Reporting": 4,
            "Governance": 4,
            "Change Management": 4,
            "Vendor Management": 3,
            "Delivery Management": 4,
        },
        "Head of Product": {
            "Product Strategy": 5,
            "Portfolio Management": 4,
            "Roadmapping": 5,
            "Stakeholder Management": 5,
            "Financial Planning": 4,
            "Team Leadership": 5,
            "Hiring": 4,
            "Data-driven Decisions": 4,
            "Org Design": 4,
            "Executive Communication": 5,
        },
        "Tech Strategy Lead": {
            "Tech Strategy": 5,
            "Architecture": 4,
            "Market Analysis": 4,
            "Platform Strategy": 4,
            "Executive Communication": 4,
            "Change Management": 4,
            "OKRs": 4,
            "Vendor Management": 3,
            "Security & Compliance": 3,
            "Roadmapping": 4,
        },
        "Delivery Lead": {
            "Delivery Management": 5,
            "Program Management": 4,
            "Stakeholder Management": 4,
            "Risk Management": 4,
            "Agile Practices": 4,
            "Resource Planning": 4,
            "Reporting": 4,
            "Quality Governance": 4,
            "Coaching": 3,
            "Incident Management": 3,
        },
    }

    # Normalize levels to max 5 and min 1
    normalized: Dict[str, Dict[str, int]] = {}
    for role, skills in roles.items():
        normalized[role] = {k: max(1, min(5, v)) for k, v in skills.items()}
    return normalized


# PUBLIC_INTERFACE
def seed_roles_and_skills(db: Session) -> None:
    """Seed the database with roles, skills, and role-skill mappings.

    Behavior and guarantees:
    - Idempotent: running multiple times does not create duplicates.
    - Ensures at least 15 roles exist with 10–20 skills each (per specs).
    - Creates Skill, Role, and RoleSkill rows as needed.
    """
    seed_data = _get_role_seed_data()

    # Gather all unique skill names
    all_skill_names = set()
    for skill_map in seed_data.values():
        all_skill_names.update(skill_map.keys())

    # Ensure skills exist
    existing_skills = {
        s.name: s for s in db.query(Skill).filter(Skill.name.in_(list(all_skill_names))).all()
    }
    for name in all_skill_names:
        if name not in existing_skills:
            db.add(Skill(name=name, description=f"{name} competency"))
    db.commit()
    # Refresh skill cache
    existing_skills = {s.name: s for s in db.query(Skill).filter(Skill.name.in_(list(all_skill_names))).all()}

    # Ensure roles and mappings exist
    for role_name, skill_levels in seed_data.items():
        role = db.query(Role).filter_by(name=role_name).first()
        if not role:
            role = Role(name=role_name, description=f"{role_name} responsibilities and expectations.")
            db.add(role)
            db.commit()
            db.refresh(role)

        # Map skills to role with required levels
        for skill_name, level_req in skill_levels.items():
            skill = existing_skills[skill_name]
            existing_mapping = (
                db.query(RoleSkill)
                .filter_by(role_id=role.id, skill_id=skill.id)
                .first()
            )
            if not existing_mapping:
                db.add(RoleSkill(role_id=role.id, skill_id=skill.id, level_required=max(1, min(5, level_req))))

        db.commit()
