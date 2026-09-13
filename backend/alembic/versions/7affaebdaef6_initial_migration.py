"""initial migration

Revision ID: 7affaebdaef6
Revises:
Create Date: 2026-09-10

"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = "7affaebdaef6"
down_revision: Union[str, Sequence[str], None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "user",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("username", sa.String(), nullable=False),
        sa.Column("email", sa.String(), nullable=False),
        sa.Column("hashed_password", sa.String(), nullable=False),
        sa.Column("role", sa.String(), nullable=False),
        sa.Column("email_notifications", sa.Boolean(), nullable=False),
        sa.Column("incident_alerts", sa.Boolean(), nullable=False),
        sa.Column("maintenance_notifications", sa.Boolean(), nullable=False),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("username"),
        sa.UniqueConstraint("email"),
    )

    op.create_index(
        "ix_user_username",
        "user",
        ["username"],
        unique=False,
    )

    op.create_index(
        "ix_user_email",
        "user",
        ["email"],
        unique=False,
    )

    op.create_index(
        "ix_user_role",
        "user",
        ["role"],
        unique=False,
    )

    op.create_table(
        "monitor",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("name", sa.String(), nullable=False),
        sa.Column("url", sa.String(), nullable=False),
        sa.Column("check_interval", sa.Integer(), nullable=False),
        sa.Column("expected_status", sa.Integer(), nullable=False),
        sa.Column("user_id", sa.Integer(), nullable=False),
        sa.ForeignKeyConstraint(
            ["user_id"],
            ["user.id"],
        ),
        sa.PrimaryKeyConstraint("id"),
    )

    op.create_table(
        "checkresult",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("monitor_id", sa.Integer(), nullable=False),
        sa.Column("status_code", sa.Integer(), nullable=True),
        sa.Column("response_time", sa.Float(), nullable=False),
        sa.Column("is_up", sa.Boolean(), nullable=False),
        sa.Column("error_message", sa.String(), nullable=True),
        sa.Column("checked_at", sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(
            ["monitor_id"],
            ["monitor.id"],
        ),
        sa.PrimaryKeyConstraint("id"),
    )

    op.create_table(
        "incident",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("monitor_id", sa.Integer(), nullable=False),
        sa.Column("started_at", sa.DateTime(), nullable=False),
        sa.Column("resolved_at", sa.DateTime(), nullable=True),
        sa.Column("status", sa.String(), nullable=False),
        sa.Column("reason", sa.String(), nullable=True),
        sa.ForeignKeyConstraint(
            ["monitor_id"],
            ["monitor.id"],
        ),
        sa.PrimaryKeyConstraint("id"),
    )


def downgrade() -> None:
    op.drop_table("incident")
    op.drop_table("checkresult")
    op.drop_table("monitor")

    op.drop_index("ix_user_role", table_name="user")
    op.drop_index("ix_user_email", table_name="user")
    op.drop_index("ix_user_username", table_name="user")

    op.drop_table("user")