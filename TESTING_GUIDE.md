# Everloop Testing Guide

## Quick Start for Testers

### Step 1: Access the App

The app is running in a GitHub Codespace. You'll receive a URL that looks like:
```
https://[codespace-name]-3000.app.github.dev
```

### Step 2: Database Setup (One-time, Admin Only)

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Open your Everloop project
3. Navigate to **SQL Editor**
4. Copy and paste the contents of `supabase/COMPLETE_SETUP.sql`
5. Click **Run** to execute

This creates all tables, security policies, and seed data.

---

## Test Scenarios

### 1. ✅ User Registration & Login

**Test Steps:**
1. Click "Enter the Loop" on homepage
2. Click "Sign Up" 
3. Enter email and password (min 6 characters)
4. Submit and check email for confirmation link
5. Confirm email and log in

**Expected:** User lands on dashboard with empty story list

---

### 2. ✅ Create Your First Story

**Test Steps:**
1. From Dashboard, click "Create Story"
2. Fill in story basics (title, synopsis)
3. Select a Time Period and Arc from dropdowns
4. Choose existing characters OR click "Create Your Own"
5. Choose existing locations OR click "Create Your Own"
6. Proceed to writing phase
7. Write content and save

**Expected:** Story saves as draft, appears in Story Desk

---

### 3. ✅ Character Creation Wizard

**Test Steps:**
1. During story creation, click "Create Your Own" under characters
2. Wizard opens with 5 steps:
   - Basics (name, title, role)
   - Appearance (physical description)
   - Personality (traits selection)
   - Background (backstory)
   - Review
3. Complete all steps and submit

**Expected:** Character created and added to story

---

### 4. ✅ Location Creation Wizard

**Test Steps:**
1. During story creation, click "Create Your Own" under locations
2. Wizard opens with 4 steps:
   - Basics (name, region, terrain)
   - Description
   - Features (notable aspects)
   - Review
3. Complete all steps and submit

**Expected:** Location created and added to story

---

### 5. ✅ Explore Canon Content

**Test Steps:**
1. Navigate to **Explore** from dashboard
2. Browse Characters tab - should see canon characters
3. Browse Locations tab - should see canon locations
4. Browse Lore tab - should see lore entries
5. Search functionality works

**Expected:** All seeded content appears correctly

---

### 6. ✅ Canon Feed

**Test Steps:**
1. Navigate to **Canon** from dashboard
2. View Canon Rules
3. Check contribution history (if any)
4. See pending/approved contributions

**Expected:** Canon rules display, contribution system works

---

### 7. ✅ Writing Studio

**Test Steps:**
1. Navigate to **Write** or click "Continue Writing" on a story
2. Editor loads with story content
3. Word count updates as you type
4. Save button works
5. What If? suggestions (if API key configured)

**Expected:** Rich writing experience with all tools functional

---

### 8. ✅ Reader Mode

**Test Steps:**
1. Navigate to **Reader Mode** from dashboard
2. Browse published stories
3. View character gallery
4. Explore locations
5. Passive reading experience (no editing)

**Expected:** Clean reading interface for non-writers

---

### 9. ✅ Settings Page

**Test Steps:**
1. Navigate to **Settings** from dashboard
2. Update display name
3. Update bio
4. Toggle notification preferences
5. Toggle appearance settings

**Expected:** All settings save correctly

---

### 10. ✅ Navigation Test

**Test Steps:**
1. Visit each page from dashboard:
   - Story Desk (/desk)
   - Writing Studio (/write)  
   - Explore (/explore)
   - LoreForge (/lore)
   - Story Paths (/paths)
   - Canon (/canon)
   - Events (/events)
   - Reader Mode (/reader)
   - Characters (/characters)
   - Quests (/quests)
   - Maps (/maps)
   - Settings (/settings)

**Expected:** All pages load without errors

---

## Known Limitations

1. **AI Features** require OpenAI API key in `.env.local`
2. **Email Confirmation** requires Supabase email settings
3. **File Uploads** not yet implemented
4. **Story Publishing** requires admin approval in current flow

---

## Reporting Issues

If you find a bug:
1. Note the page URL
2. Describe what you clicked/did
3. Describe what you expected
4. Describe what actually happened
5. Include any error messages

Send to: [your email or GitHub Issues]

---

## Quick Reference

| Feature | URL | Status |
|---------|-----|--------|
| Homepage | / | ✅ |
| Login | /auth/login | ✅ |
| Signup | /auth/signup | ✅ |
| Dashboard | /dashboard | ✅ |
| Story Desk | /desk | ✅ |
| Create Story | /story/new | ✅ |
| Writing | /write | ✅ |
| Explore | /explore | ✅ |
| Canon | /canon | ✅ |
| Characters | /characters | ✅ |
| Quests | /quests | ✅ |
| Maps | /maps | ✅ |
| Events | /events | ✅ |
| Reader Mode | /reader | ✅ |
| Settings | /settings | ✅ |
| Admin | /admin | ✅ (admin only) |
