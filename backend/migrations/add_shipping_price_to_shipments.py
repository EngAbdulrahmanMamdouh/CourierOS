from alembic import op
import sqlalchemy as sa


def upgrade():
    op.add_column('shipments', sa.Column('shipping_price', sa.Float(), nullable=True))


def downgrade():
    op.drop_column('shipments', 'shipping_price')
