# /cipher_escape_project/models.py
from flask_sqlalchemy import SQLAlchemy
from werkzeug.security import generate_password_hash, check_password_hash
from datetime import datetime, timezone

db = SQLAlchemy()

class User(db.Model):
    __tablename__ = 'user'
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False, index=True)
    email = db.Column(db.String(120), unique=True, nullable=False, index=True)
    password_hash = db.Column(db.String(256), nullable=False)
    # --- ADD is_admin field ---
    is_admin = db.Column(db.Boolean, nullable=False, default=False) # Default to NOT admin
    # --- END is_admin field ---

    scores = db.relationship('Leaderboard', backref='player', lazy=True, cascade="all, delete-orphan")
    completions = db.relationship('RoomCompletion', backref='user', lazy=True, cascade="all, delete-orphan")

    def set_password(self, password):
        self.password_hash = generate_password_hash(password)

    def check_password(self, password):
        if self.password_hash is None: return False
        return check_password_hash(self.password_hash, password)

    def get_total_score(self):
        total = db.session.query(db.func.sum(Leaderboard.score)).filter_by(user_id=self.id).scalar()
        return total or 0

    def __repr__(self):
        return f'<User {self.username} {"(Admin)" if self.is_admin else ""}>' # Indicate admin status

# --- RoomCompletion and Leaderboard models remain the same ---
class RoomCompletion(db.Model):
    # ... (Keep RoomCompletion definition as before) ...
    __tablename__ = 'room_completion'
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False, index=True)
    room_id = db.Column(db.String(80), nullable=False, index=True)
    completed_at = db.Column(db.DateTime, nullable=False, default=lambda: datetime.now(timezone.utc))
    start_time = db.Column(db.DateTime, nullable=True)
    time_taken_seconds = db.Column(db.Integer, nullable=True)
    errors_made = db.Column(db.Integer, default=0, nullable=True)
    __table_args__ = (db.UniqueConstraint('user_id', 'room_id', name='_user_room_uc'),)

    def __repr__(self):
        user_repr = self.user.username if self.user else f"ID:{self.user_id}"
        return f'<RoomCompletion User: {user_repr} Room: {self.room_id}>'


class Leaderboard(db.Model):
    # ... (Keep Leaderboard definition as before) ...
    __tablename__ = 'leaderboard'
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False, index=True)
    room_id = db.Column(db.String(80), nullable=False, index=True)
    score = db.Column(db.Integer, nullable=False, default=0, index=True)
    time_seconds = db.Column(db.Integer, nullable=True)
    achieved_at = db.Column(db.DateTime, nullable=False, default=lambda: datetime.now(timezone.utc))
    badges_earned = db.Column(db.String(255), nullable=True)
    __table_args__ = (db.UniqueConstraint('user_id', 'room_id', name='_user_room_score_uc'),)

    def __repr__(self):
        user_repr = self.player.username if self.player else f"ID:{self.user_id}"
        return f'<Leaderboard User: {user_repr} Room: {self.room_id} Score: {self.score}>'