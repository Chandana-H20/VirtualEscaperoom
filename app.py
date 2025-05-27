# /cipher_escape_project/app.py
import os
import functools
import re
from datetime import datetime, timezone, timedelta
from flask import Flask, render_template, request, redirect, url_for, session, flash, g, jsonify
from flask_migrate import Migrate # Keep if using migrations
from werkzeug.security import generate_password_hash, check_password_hash
import click
from sqlalchemy import desc, func

# --- Flask-Admin Imports ---
from flask_admin import Admin, AdminIndexView, expose
from flask_admin.contrib.sqla import ModelView
# Import specific filter types known to be generally available
from flask_admin.contrib.sqla.filters import (
    FilterEqual, FilterLike, FilterNotEqual, FilterGreater, FilterSmaller,
    DateBetweenFilter, DateTimeBetweenFilter, IntEqualFilter
)
# --- End Flask-Admin Imports ---

from config import Config
# Correctly import db and models
from models import db, User, RoomCompletion, Leaderboard

app = Flask(__name__)
app.config.from_object(Config)

# Initialize extensions
db.init_app(app)
migrate = Migrate(app, db) # Initialize migrations

# --- Room Data (Constants) ---
ROOM_DATA = {
    'hacker_lair': { 'id': 'hacker_lair', 'name': "The Hacker's Lair", 'template': 'hacker_lair.html', 'difficulty': 'easy', 'players': '1', 'time': '45', 'description': "Break into a mysterious hacker's system.", 'prerequisite': None, 'js_file': 'hacker_lair.js' },
    'quantum_paradox': { 'id': 'quantum_paradox', 'name': "Quantum Paradox", 'template': 'quantum_paradox.html', 'difficulty': 'medium', 'players': '1', 'time': '60', 'description': "Navigate through time and dimensions.", 'prerequisite': 'hacker_lair', 'js_file': 'quantum_paradox.js' },
    'ancient_tomb': { 'id': 'ancient_tomb', 'name': "The Ancient Tomb", 'template': 'ancient_tomb.html', 'difficulty': 'hard', 'players': '1', 'time': '75', 'description': "Uncover secrets before the curse claims you.", 'prerequisite': 'quantum_paradox', 'js_file': 'ancient_tomb.js' },
    'derelict_station': { 'id': 'derelict_station', 'name': "The Derelict Station", 'template': 'derelict_station.html', 'difficulty': 'medium', 'players': '1', 'time': '60', 'description': "Restore power to an abandoned space station.", 'prerequisite': 'ancient_tomb', 'js_file': 'derelict_station.js' },
    'crimson_case': { 'id': 'crimson_case', 'name': "The Crimson Case", 'template': 'crimson_case.html', 'difficulty': 'medium', 'players': '1', 'time': '50', 'description': "Solve a noir mystery in a detective's office.", 'prerequisite': 'derelict_station', 'js_file': 'crimson_case.js' },
    'whispering_woods': { 'id': 'whispering_woods', 'name': "Whispering Woods", 'template': 'whispering_woods.html', 'difficulty': 'easy-medium', 'players': '1', 'time': '45', 'description': "Appease nature spirits in an enchanted forest.", 'prerequisite': 'crimson_case', 'js_file': 'whispering_woods.js' },
    'steampunk_library': { 'id': 'steampunk_library', 'name': "Steampunk Library", 'template': 'steampunk_library.html', 'difficulty': 'medium', 'players': '1', 'time': '65', 'description': "Decode mysteries in a clockwork archive.", 'prerequisite': 'whispering_woods', 'js_file': 'steampunk_library.js' },
    'sunken_ship': { 'id': 'sunken_ship', 'name': "Sunken Pirate Ship", 'template': 'sunken_ship.html', 'difficulty': 'medium-hard', 'players': '1', 'time': '70', 'description': "Explore a wreck and find the lost treasure.", 'prerequisite': 'steampunk_library', 'js_file': 'sunken_ship.js' },
    'biolab_escape': { 'id': 'biolab_escape', 'name': "Biolab Escape", 'template': 'biolab_escape.html', 'difficulty': 'hard', 'players': '1', 'time': '75', 'description': "Contain the outbreak before it's too late.", 'prerequisite': 'sunken_ship', 'js_file': 'biolab_escape.js' },
    'castle_siege': { 'id': 'castle_siege', 'name': "Castle Siege", 'template': 'castle_siege.html', 'difficulty': 'hard', 'players': '1', 'time': '80', 'description': "Defend the keep or find the secret escape.", 'prerequisite': 'biolab_escape', 'js_file': 'castle_siege.js' },
    'alien_starship': { 'id': 'alien_starship', 'name': "Alien Starship", 'template': 'alien_starship.html', 'difficulty': 'hard', 'players': '1', 'time': '80', 'description': "Decode alien tech and escape the bridge.", 'prerequisite': 'castle_siege', 'js_file': 'alien_starship.js' },
    'mad_workshop': { 'id': 'mad_workshop', 'name': "Mad Scientist's Workshop", 'template': 'mad_workshop.html', 'difficulty': 'medium-hard', 'players': '1', 'time': '70', 'description': "Mix potions and fix gadgets before the timer runs out!", 'prerequisite': 'alien_starship', 'js_file': 'mad_workshop.js' },
}
# --- UPDATED Room Order ---
ROOM_ORDER = [
    'hacker_lair', 'quantum_paradox', 'ancient_tomb', 'derelict_station',
    'crimson_case', 'whispering_woods', 'steampunk_library', 'sunken_ship',
    'biolab_escape', 'castle_siege', 'alien_starship', 'mad_workshop' # Added new rooms
]
# --- UPDATED Total Rooms ---
TOTAL_ROOMS = len(ROOM_ORDER)

# --- UPDATED Badge Definitions ---
BADGE_CRITERIA = {
    # Existing Rooms...
    'hacker_lair': {
        'hacker_lair_speed': {'time_max_sec': 30 * 60, 'icon': 'fas fa-bolt', 'name': 'Hacker Speed Demon'},
        'hacker_lair_flawless': {'max_errors': 0, 'icon': 'fas fa-shield-alt', 'name': 'Flawless Hack'},
    },
    'quantum_paradox': {
         'quantum_paradox_quick': {'time_max_sec': 40 * 60, 'icon': 'fas fa-fighter-jet', 'name': 'Quantum Quickstep'},
         'quantum_paradox_precise': {'max_errors': 1, 'icon': 'fas fa-crosshairs', 'name': 'Temporal Precision'},
    },
    'ancient_tomb': {
        'ancient_tomb_swift': {'time_max_sec': 50 * 60, 'icon': 'fas fa-stopwatch', 'name': 'Swift Tomb Raider'},
        'ancient_tomb_master': {'max_errors': 1, 'icon': 'fas fa-brain', 'name': 'Tomb Puzzle Master'},
    },
    'derelict_station': {
         'derelict_station_rapid': {'time_max_sec': 45 * 60, 'icon': 'fas fa-tachometer-alt', 'name': 'Station Rapid Repair'},
         'derelict_station_clean': {'max_errors': 0, 'icon': 'fas fa-broom', 'name': 'Clean Sweep'},
    },
    'crimson_case': {
         'crimson_case_gumshoe': {'time_max_sec': 35 * 60, 'icon': 'fas fa-user-secret', 'name': 'Ace Gumshoe'},
         'crimson_case_sharp': {'max_errors': 1, 'icon': 'fas fa-search', 'name': 'Sharp Eyed'},
    },
    'whispering_woods': {
         'whispering_woods_spirit': {'time_max_sec': 30 * 60, 'icon': 'fas fa-wind', 'name': 'Spirit Whisperer'},
         'whispering_woods_perfect': {'max_errors': 0, 'icon': 'fas fa-leaf', 'name': 'Forest Harmony'},
    },
    'steampunk_library': {
         'steampunk_library_tinkerer': {'max_errors': 1, 'icon': 'fas fa-cogs', 'name': 'Master Tinkerer'},
         'steampunk_library_reader': {'time_max_sec': 45 * 60, 'icon': 'fas fa-book-open', 'name': 'Speed Reader'},
    },
     'sunken_ship': {
         'sunken_ship_diver': {'time_max_sec': 55 * 60, 'icon': 'fas fa-water', 'name': 'Deep Diver'},
         'sunken_ship_treasure': {'max_errors': 2, 'icon': 'fas fa-gem', 'name': 'Treasure Hunter'}, # More forgiving
    },
     'biolab_escape': {
         'biolab_escape_contain': {'max_errors': 0, 'icon': 'fas fa-biohazard', 'name': 'Containment Specialist'},
         'biolab_escape_swift': {'time_max_sec': 60 * 60, 'icon': 'fas fa-running', 'name': 'Swift Evacuation'},
    },
     'castle_siege': {
         'castle_siege_defender': {'max_errors': 3, 'icon': 'fas fa-shield-alt', 'name': 'Valiant Defender'}, # Even more forgiving on errors
         'castle_siege_strategist': {'time_max_sec': 65 * 60, 'icon': 'fas fa-chess-knight', 'name': 'Siege Strategist'},
    },
    # --- NEW ROOM BADGES ---
    'alien_starship': {
        'alien_starship_linguist': {'max_errors': 1, 'icon': 'fas fa-language', 'name': 'Xeno-Linguist'},
        'alien_starship_navigator': {'time_max_sec': 60 * 60, 'icon': 'fas fa-rocket', 'name': 'Starship Navigator'},
    },
    'mad_workshop': {
        'mad_workshop_chemist': {'max_errors': 1, 'icon': 'fas fa-flask', 'name': 'Master Chemist'},
        'mad_workshop_mechanic': {'time_max_sec': 50 * 60, 'icon': 'fas fa-wrench', 'name': 'Gadget Fixer'},
    },
    # --- END NEW BADGES ---
    'all_rooms': { # Global badges
        'grand_master': {'icon': 'fas fa-crown', 'name': 'Grand Master Escapist'},
        'ultimate_solver': {'icon': 'fas fa-atom', 'name': 'Ultimate Solver'} # Example based on score
    }
}

# --- Email Regex ---
EMAIL_REGEX = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'

# --- Helper Functions & Context Processors ---
@app.before_request
def load_logged_in_user():
    """Load user object, completed rooms, and badges into Flask's 'g' object."""
    user_id = session.get('user_id')
    g.user = None
    g.completed_room_ids = set()
    g.user_badges = set()
    if user_id is not None:
        g.user = db.session.get(User, user_id)
        if g.user:
            g.completed_room_ids = {comp.room_id for comp in g.user.completions}
            scores = Leaderboard.query.filter_by(user_id=g.user.id).all()
            for entry in scores:
                if entry.badges_earned:
                    g.user_badges.update(b.strip() for b in entry.badges_earned.split(',') if b.strip())
            if len(g.completed_room_ids) == TOTAL_ROOMS:
                g.user_badges.add('grand_master')
                # Check for other global badges
                # total_score = g.user.get_total_score()
                # if total_score > 90000: # Example threshold
                #     g.user_badges.add('ultimate_solver')
        elif user_id is not None: # User ID in session but not in DB
            session.clear()

def login_required(view):
    """Decorator to require login for accessing a view."""
    @functools.wraps(view)
    def wrapped_view(**kwargs):
        if g.user is None: flash("Please log in to access this page.", "warning"); return redirect(url_for('login', next=request.url))
        return view(**kwargs)
    return wrapped_view

# --- ADMIN ACCESS CONTROL ---
def is_admin_user():
    """Checks if the currently logged-in user has admin privileges."""
    # Replace with your actual admin check logic
    return g.user is not None and getattr(g.user, 'is_admin', False) # Check the is_admin flag

class SecureAdminIndexView(AdminIndexView):
    """Custom Admin Index View with access control."""
    @expose('/')
    def index(self):
        if not is_admin_user(): return redirect(url_for('login', next=request.url))
        return super(SecureAdminIndexView, self).index()
    def is_accessible(self): return is_admin_user()
    def inaccessible_callback(self, name, **kwargs): flash("Admin access required.", "danger"); return redirect(url_for('login', next=request.url))

class SecureModelView(ModelView):
    """Custom Model View with access control."""
    def is_accessible(self): return is_admin_user()
    def inaccessible_callback(self, name, **kwargs): flash("Admin access required.", "danger"); return redirect(url_for('login', next=request.url))

# --- Custom Admin Views for Models ---
def _format_time_admin(view, context, model, name):
    """Helper to format time in Admin views."""
    seconds = getattr(model, name, None);
    if seconds is None or not isinstance(seconds, (int, float)) or seconds < 0: return "--:--"
    minutes = int(seconds // 60); secs = int(seconds % 60); return f"{minutes:02d}:{secs:02d}"

class UserAdminView(SecureModelView):
    column_list = ('id', 'username', 'email', 'is_admin')
    form_excluded_columns = ('password_hash', 'completions', 'scores')
    column_searchable_list = ('username', 'email')
    column_filters = (FilterLike(User.username, 'Username'), FilterLike(User.email, 'Email'), FilterEqual(User.is_admin,'Is Admin'))
    can_create = False; can_edit = True; can_delete = True

class RoomCompletionAdminView(SecureModelView):
    column_list = ('id', 'user.username', 'room_id', 'completed_at', 'time_taken_seconds', 'errors_made')
    column_labels = {'user.username': 'User', 'room_id': 'Room', 'completed_at': 'Completed On','time_taken_seconds': 'Time', 'errors_made': 'Errors'}
    column_formatters = { 'time_taken_seconds': _format_time_admin }
    column_default_sort = ('completed_at', True)
    column_searchable_list = ('room_id',) # Search only direct columns
    column_filters = [FilterEqual(RoomCompletion.room_id, 'Room ID'), DateTimeBetweenFilter(RoomCompletion.completed_at, 'Completion Date'), IntEqualFilter(RoomCompletion.errors_made, 'Errors Made'), FilterLike(User.username, 'User')]
    column_joins = { 'user': ('user', User) } # Define join needed for filter/display
    can_create = False; can_edit = False; can_delete = True

class LeaderboardAdminView(SecureModelView):
    column_list = ('id', 'player.username', 'room_id', 'score', 'time_seconds', 'achieved_at', 'badges_earned')
    column_labels = {'player.username': 'Player', 'room_id': 'Room', 'time_seconds': 'Time','achieved_at': 'Achieved On', 'badges_earned': 'Badges'}
    column_formatters = { 'time_seconds': _format_time_admin }
    column_default_sort = ('score', True)
    column_searchable_list = ('room_id', 'badges_earned') # Search direct columns only
    column_filters = [FilterEqual(Leaderboard.room_id, 'Room ID'), 'score', DateTimeBetweenFilter(Leaderboard.achieved_at, 'Date Achieved'), FilterLike(User.username, 'Player')]
    column_joins = { 'player': ('player', User) } # Define join needed for filter/display
    can_create = False; can_edit = False; can_delete = True

# --- Flask-Admin Setup ---
admin = Admin(app, name='Cipher Escape Admin', template_mode='bootstrap4', index_view=SecureAdminIndexView())
admin.add_view(UserAdminView(User, db.session))
admin.add_view(RoomCompletionAdminView(RoomCompletion, db.session, name="Completions"))
admin.add_view(LeaderboardAdminView(Leaderboard, db.session))
# --- End Flask-Admin Setup ---

@app.context_processor
def inject_utilities():
    """Inject common variables/functions into all templates."""
    def format_time_template(seconds):
        """Format seconds into MM:SS string for templates."""
        class DummyModel: pass # Create dummy object for helper compatibility
        model_instance = DummyModel(); setattr(model_instance, 'time_seconds_attr', seconds)
        return _format_time_admin(None, None, model_instance, 'time_seconds_attr')
    return {'now': datetime.now(timezone.utc), 'BADGE_CRITERIA': BADGE_CRITERIA, 'format_time': format_time_template}


# --- Routes ---

@app.route('/')
def index():
    """Landing page. Redirects to dashboard if logged in."""
    if g.user: return redirect(url_for('rooms'))
    return render_template('index.html', title="Cipher Escape")

@app.route('/register', methods=['GET', 'POST'])
def register():
    """Handles user registration."""
    if g.user: return redirect(url_for('rooms'))
    if request.method == 'POST':
        username = request.form.get('username', '').strip()
        email = request.form.get('email', '').strip().lower()
        password = request.form.get('password', '')
        confirm_password = request.form.get('confirm_password', '')
        error = None
        # Validation
        if not username: error = 'Username is required.'
        elif len(username) < 3: error = 'Username must be at least 3 characters.'
        elif not email: error = 'Email is required.'
        elif not re.match(EMAIL_REGEX, email): error = 'Invalid email format.'
        elif not password: error = 'Password is required.'
        elif len(password) < 6: error = 'Password must be at least 6 characters.'
        elif password != confirm_password: error = 'Passwords do not match.'
        else:
            user_exists = db.session.execute(db.select(User.id).filter_by(username=username)).scalar()
            if user_exists: error = f"Username '{username}' is already taken."
            else:
                email_exists = db.session.execute(db.select(User.id).filter_by(email=email)).scalar()
                if email_exists: error = f"Email '{email}' is already registered."
        # Creation
        if error is None:
            try:
                new_user = User(username=username, email=email); new_user.set_password(password)
                db.session.add(new_user); db.session.commit()
                session.clear(); session['user_id'] = new_user.id
                flash(f"Account created! Welcome, {username}!", "success")
                return redirect(url_for('rooms'))
            except Exception as e:
                db.session.rollback(); app.logger.error(f"Reg failed: {e}"); flash("Registration failed.", "danger")
        if error: flash(error, 'danger')
    return render_template('register.html', title="Register", form_data=request.form or {})

@app.route('/login', methods=['GET', 'POST'])
def login():
    """Handles user login."""
    if g.user: return redirect(url_for('rooms'))
    if request.method == 'POST':
        username = request.form.get('username', '').strip()
        password = request.form.get('password', '')
        error = None
        user = db.session.execute(db.select(User).filter_by(username=username)).scalar_one_or_none()
        if user is None or not user.check_password(password): error = 'Incorrect username or password.'
        else:
            session.clear(); session['user_id'] = user.id
            flash(f"Welcome back, {username}!", "success")
            return redirect(url_for('rooms'))
        if error: flash(error, 'danger')
    return render_template('login.html', title="Login", form_data=request.form or {})

@app.route('/logout')
def logout():
    """Logs the user out."""
    session.clear(); flash("You have been logged out.", "info"); return redirect(url_for('index'))

@app.route('/dashboard')
@login_required
def rooms():
    """Displays the User Dashboard."""
    completed_room_ids = g.completed_room_ids
    accessible_rooms_info = []
    total_completed = len(completed_room_ids)
    for room_id in ROOM_ORDER:
        if room_id in ROOM_DATA:
            room = ROOM_DATA[room_id].copy()
            prereq = room.get('prerequisite')
            room['is_completed'] = room_id in completed_room_ids
            room['is_accessible'] = (prereq is None) or (prereq in completed_room_ids)
            accessible_rooms_info.append(room)
    return render_template('rooms.html', title="Dashboard", user=g.user, rooms=accessible_rooms_info,
                           total_completed=total_completed, total_rooms=TOTAL_ROOMS, ALL_ROOM_DATA=ROOM_DATA,
                           user_badges=g.user_badges)

@app.route('/start_room/<room_id>')
@login_required
def start_room(room_id):
    """Starts a room attempt, recording start time and resetting errors."""
    if room_id not in ROOM_DATA: flash("Invalid room.", "danger"); return redirect(url_for('rooms'))
    room = ROOM_DATA[room_id]
    prereq = room.get('prerequisite')
    is_accessible = (prereq is None) or (prereq in g.completed_room_ids)
    if not is_accessible: flash("Access denied. Prerequisite not met.", "warning"); return redirect(url_for('rooms'))
    session[f'room_{room_id}_start'] = datetime.now(timezone.utc).isoformat()
    session[f'room_{room_id}_errors'] = 0
    session.modified = True
    return redirect(url_for('view_room', room_id=room_id))


@app.route('/room/<room_id>')
@login_required
def view_room(room_id):
    """Serves the specific escape room page."""
    if room_id not in ROOM_DATA: flash("Invalid room selected.", "danger"); return redirect(url_for('rooms'))
    room = ROOM_DATA[room_id]
    prereq = room.get('prerequisite')
    is_accessible = (prereq is None) or (prereq in g.completed_room_ids)
    if not is_accessible:
        prereq_name = ROOM_DATA.get(prereq, {}).get('name', 'the previous room')
        flash(f"Access denied. You must complete '{prereq_name}' first!", "warning")
        return redirect(url_for('rooms'))
    # Pass room data, including js_file name, to the template
    return render_template(room['template'], title=room['name'], room=room)


@app.route('/report_error/<room_id>', methods=['POST'])
@login_required
def report_error(room_id):
    """API endpoint for JS to report an error during a timed attempt."""
    if room_id not in ROOM_DATA: return jsonify(success=False, message="Invalid room"), 404
    session_key_start = f'room_{room_id}_start'; session_key_errors = f'room_{room_id}_errors'
    if session_key_start in session:
        error_count = session.get(session_key_errors, 0); session[session_key_errors] = error_count + 1
        session.modified = True; return jsonify(success=True, errors=session[session_key_errors])
    else: return jsonify(success=False, message="Room timer not active")


@app.route('/complete_room/<room_id>', methods=['POST'])
@login_required
def complete_room(room_id):
    """Handles room completion: calculates results, updates DB, redirects."""
    if room_id not in ROOM_DATA: flash("Invalid room completion attempt.", "danger"); return redirect(url_for('rooms'))
    room = ROOM_DATA[room_id]; prereq = room.get('prerequisite')
    is_accessible = (prereq is None) or (prereq in g.completed_room_ids)
    if not is_accessible: flash("Cannot mark room as complete. Prerequisite not met.", "danger"); return redirect(url_for('rooms'))

    start_time_iso = session.pop(f'room_{room_id}_start', None); errors_made = session.pop(f'room_{room_id}_errors', 0); session.modified = True
    time_taken_seconds = None; score = 0; earned_badges_ids = []; start_time_dt = None

    if start_time_iso:
        try:
            start_time_dt = datetime.fromisoformat(start_time_iso)
            if start_time_dt.tzinfo is None: start_time_dt = start_time_dt.replace(tzinfo=timezone.utc)
            end_time = datetime.now(timezone.utc); time_taken = end_time - start_time_dt
            time_taken_seconds = max(1, int(time_taken.total_seconds()))
            base_score = 10000; room_time_limit = int(room.get('time', 60)) * 60
            time_penalty_factor = base_score / (room_time_limit * 1.5) if room_time_limit > 0 else base_score
            time_penalty = int(time_taken_seconds * time_penalty_factor); error_penalty = errors_made * 250
            score = max(50, base_score - time_penalty - error_penalty)
            room_criteria = BADGE_CRITERIA.get(room_id, {})
            for badge_id, criteria in room_criteria.items():
                badge_earned = True
                if 'time_max_sec' in criteria and time_taken_seconds > criteria['time_max_sec']: badge_earned = False
                if 'max_errors' in criteria and errors_made > criteria['max_errors']: badge_earned = False
                if badge_earned: earned_badges_ids.append(badge_id)
        except Exception as e: app.logger.error(f"Calc error: {e}"); flash("Error calculating results.", "warning"); score = 0
    else: flash("Attempt details not found. Score/time/badges not recorded.", "warning"); score = 0

    already_completed = room_id in g.completed_room_ids
    try:
        # Only record completion details on the very first time
        if not already_completed:
            completion = RoomCompletion(user_id=g.user.id, room_id=room_id, start_time=start_time_dt,
                                      time_taken_seconds=time_taken_seconds, errors_made=errors_made)
            db.session.add(completion)

        # Add/Update Leaderboard entry only if it was a timed run
        if start_time_iso:
            existing_score_entry = Leaderboard.query.filter_by(user_id=g.user.id, room_id=room_id).first()
            badges_str = ",".join(sorted(earned_badges_ids)) if earned_badges_ids else None
            current_time = datetime.now(timezone.utc)
            if existing_score_entry:
                # Update only if score is better
                if score > existing_score_entry.score:
                     existing_score_entry.score = score; existing_score_entry.time_seconds = time_taken_seconds
                     existing_score_entry.achieved_at = current_time; existing_score_entry.badges_earned = badges_str
                     flash("New personal best score recorded!", "info")
            else: # No existing score, add new entry
                 leaderboard_entry = Leaderboard(user_id=g.user.id, room_id=room_id, score=score,
                                                 time_seconds=time_taken_seconds, badges_earned=badges_str,
                                                 achieved_at=current_time)
                 db.session.add(leaderboard_entry)
                 # Only flash main congrats message on first completion with a score
                 if not already_completed: flash(f"Congratulations! You completed '{room['name']}'. Score: {score}", "success")

        db.session.commit()
        # Refresh global state after commit only if newly completed
        if not already_completed:
            g.completed_room_ids.add(room_id)
        # Refresh badges regardless, as a replay might earn new ones or better score
        g.user_badges.update(earned_badges_ids)
        if start_time_iso and not already_completed: # Flash badges only on first completion
             for badge_id in earned_badges_ids:
                 # Find badge info potentially across room-specific or global criteria
                 badge_info = BADGE_CRITERIA.get(room_id, {}).get(badge_id) or BADGE_CRITERIA.get('all_rooms', {}).get(badge_id)
                 if badge_info: flash(f"Badge Earned: {badge_info['name']}!", "success")
        elif already_completed and start_time_iso: # Acknowledge replay if timed
            flash(f"You have replayed '{room['name']}'.", "info")


    except Exception as e:
        db.session.rollback(); app.logger.error(f"Error saving progress: {e}")
        flash("An error occurred while saving your progress.", "danger"); return redirect(url_for('rooms'))

    # --- Check for overall completion ---
    all_rooms_complete_now = len(g.completed_room_ids) == TOTAL_ROOMS
    if all_rooms_complete_now:
         if 'grand_master' not in g.user_badges:
             badge_info = BADGE_CRITERIA.get('all_rooms', {}).get('grand_master')
             if badge_info: flash(f"You've earned the '{badge_info['name']}' badge!", "success")
             g.user_badges.add('grand_master')
         # Example check for other global badges
         if 'ultimate_solver' not in g.user_badges:
              total_score = g.user.get_total_score() # Recalculate after commit
              # Check score threshold ONLY if all rooms are complete
              if total_score > 90000: # Example threshold
                    badge_info = BADGE_CRITERIA.get('all_rooms', {}).get('ultimate_solver')
                    if badge_info: flash(f"You've earned the '{badge_info['name']}' badge!", "success")
                    g.user_badges.add('ultimate_solver')

         return redirect(url_for('success'))
    else:
        return redirect(url_for('rooms'))


@app.route('/success')
@login_required
def success():
    if len(g.completed_room_ids) != TOTAL_ROOMS: flash("Not all challenges complete!", "warning"); return redirect(url_for('rooms'))
    top_overall_scores = db.session.query(User.username, func.sum(Leaderboard.score).label('total_score'))\
        .join(User, Leaderboard.user_id == User.id).group_by(User.id).order_by(desc('total_score')).limit(5).all()
    return render_template('success.html', title="Congratulations!", user=g.user, leaderboard=top_overall_scores)

@app.route('/leaderboard')
@login_required
def leaderboard():
    top_scores = db.session.query(User.username, func.sum(Leaderboard.score).label('total_score'), func.sum(Leaderboard.time_seconds).label('total_time'))\
        .join(User, Leaderboard.user_id == User.id).group_by(User.id).order_by(desc('total_score'), 'total_time').limit(20).all()
    user_total_score = g.user.get_total_score() if g.user else 0
    return render_template('leaderboard.html', title="Leaderboard", top_scores=top_scores, user_score=user_total_score)

# --- CLI Commands ---
@app.cli.command("init-db") # Keep as before
def init_db_command():
    if input("This will delete all existing data. Are you sure? (y/n): ").lower() == 'y':
        try:
            with app.app_context(): Config.ensure_instance_folder(); db.drop_all(); db.create_all()
            print("Initialized the database (dropped existing data).")
        except Exception as e: print(f"Error initializing database: {e}")
    else: print("Database initialization cancelled.")

@app.cli.command("create-user") # Keep as before
@click.argument("username")
@click.argument("email")
@click.password_option()
def create_user_command(username, email, password):
     with app.app_context():
         if User.query.filter_by(username=username).first(): print(f"Error: User '{username}' already exists."); return
         if User.query.filter_by(email=email).first(): print(f"Error: Email '{email}' already exists."); return
         if not re.match(EMAIL_REGEX, email): print(f"Error: Invalid email format."); return
         if len(password) < 6: print("Error: Password must be >= 6 characters."); return
         try: user = User(username=username, email=email); user.set_password(password); db.session.add(user); db.session.commit(); print(f"User '{username}' ({email}) created successfully.")
         except Exception as e: db.session.rollback(); print(f"Error creating user: {e}")

@app.cli.command("make-admin") # Keep as before
@click.argument("username")
def make_admin_command(username):
     with app.app_context():
         user = db.session.execute(db.select(User).filter_by(username=username)).scalar_one_or_none()
         if user is None: print(f"Error: User '{username}' not found."); return
         try: user.is_admin = True; db.session.commit(); print(f"User '{username}' is now an administrator.")
         except Exception as e: db.session.rollback(); print(f"Error making user admin: {e}")

if __name__ == '__main__':
    app.run(debug=os.environ.get('FLASK_DEBUG', 'False').lower() == 'true')