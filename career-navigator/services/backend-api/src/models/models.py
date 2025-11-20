"""SQLAlchemy ORM models for the Career Navigator backend.

Defines:
- Role: Job roles within the career framework
- Skill: Skills that can be mapped to roles
- RoleSkill: Many-to-many mapping between Role and Skill with required proficiency level
- UserProgress: Tracks a user's proficiency level for a given skill
"""
from datetime import datetime
from typing import List, Optional

from sqlalchemy import (
    Integer,
    String,
    Text,
    ForeignKey,
    DateTime,
    UniqueConstraint,
)
from sqlalchemy.orm import declarative_base, relationship, Mapped, mapped_column

Base = declarative_base()


class TimestampMixin:
    """Shared created_at/updated_at timestamp fields."""
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=False), default=datetime.utcnow
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=False), default=datetime.utcnow, onupdate=datetime.utcnow
    )


class Role(Base, TimestampMixin):
    """Represents a job role with a set of required skills and levels."""
    __tablename__ = "roles"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    name: Mapped[str] = mapped_column(String(200), unique=True, nullable=False, index=True)
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)

    role_skills: Mapped[List["RoleSkill"]] = relationship(
        "RoleSkill", back_populates="role", cascade="all, delete-orphan"
    )

    # PUBLIC_INTERFACE
    def __repr__(self) -> str:
        """Representation for debugging."""
        return f"<Role id={self.id} name={self.name!r}>"


class Skill(Base, TimestampMixin):
    """Represents a skill that can be associated with one or more roles."""
    __tablename__ = "skills"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    name: Mapped[str] = mapped_column(String(200), unique=True, nullable=False, index=True)
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)

    role_skills: Mapped[List["RoleSkill"]] = relationship(
        "RoleSkill", back_populates="skill", cascade="all, delete-orphan"
    )

    # PUBLIC_INTERFACE
    def __repr__(self) -> str:
        """Representation for debugging."""
        return f"<Skill id={self.id} name={self.name!r}>"


class RoleSkill(Base, TimestampMixin):
    """Associative table between Role and Skill with required proficiency."""
    __tablename__ = "role_skills"
    __table_args__ = (
        UniqueConstraint("role_id", "skill_id", name="uq_role_skill"),
    )

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    role_id: Mapped[int] = mapped_column(ForeignKey("roles.id", ondelete="CASCADE"), nullable=False, index=True)
    skill_id: Mapped[int] = mapped_column(ForeignKey("skills.id", ondelete="CASCADE"), nullable=False, index=True)
    level_required: Mapped[int] = mapped_column(Integer, nullable=False, default=1)  # 1-5 scale

    role: Mapped["Role"] = relationship("Role", back_populates="role_skills")
    skill: Mapped["Skill"] = relationship("Skill", back_populates="role_skills")

    # PUBLIC_INTERFACE
    def __repr__(self) -> str:
        """Representation for debugging."""
        return f"<RoleSkill role_id={self.role_id} skill_id={self.skill_id} level_required={self.level_required}>"


class UserProgress(Base, TimestampMixin):
    """Tracks a user's current level for a particular skill."""
    __tablename__ = "user_progress"
    __table_args__ = (
        UniqueConstraint("user_id", "skill_id", name="uq_user_skill"),
    )

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    user_id: Mapped[str] = mapped_column(String(128), nullable=False, index=True)
    skill_id: Mapped[int] = mapped_column(ForeignKey("skills.id", ondelete="CASCADE"), nullable=False, index=True)
    level: Mapped[int] = mapped_column(Integer, nullable=False, default=0)  # 0-5 scale

    skill: Mapped["Skill"] = relationship("Skill")

    # PUBLIC_INTERFACE
    def __repr__(self) -> str:
        """Representation for debugging."""
        return f"<UserProgress user_id={self.user_id!r} skill_id={self.skill_id} level={self.level}>"
