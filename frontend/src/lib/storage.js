const HISTORY_KEY = 'chat_history';
const LEVELS_KEY = 'levels';
const LANGUAGES_KEY = 'board_languages';
const THEME_KEY = 'theme';
const SOUND_KEY = 'sound';
const SIDEBAR_KEY = 'sidebar_open';
const PROGRESS_KEY = 'progress';
const PROFILE_KEY = 'student_profile';
const LAST_BOARD_KEY = 'last_board';
const BOARDS_KEY = 'boards_list';
const PLACEMENT_KEY = 'placement';
const MEMORY_BEST_KEY = 'memory_best';
const MEMORY_SEEN_KEY = 'memory_seen';

export const storage = {
  loadHistory(subject = 'english') {
    try {
      const parsed = JSON.parse(localStorage.getItem(this.historyKey(subject)));
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  },

  saveHistory(subject, messages) {
    try {
      localStorage.setItem(this.historyKey(subject), JSON.stringify(messages));
    } catch {}
  },

  historyKey(subject) {
    return subject === 'english' ? HISTORY_KEY : `${HISTORY_KEY}:${subject}`;
  },

  loadLevels() {
    try {
      const parsed = JSON.parse(localStorage.getItem(LEVELS_KEY));
      return parsed && typeof parsed === 'object' ? parsed : null;
    } catch {
      return null;
    }
  },

  saveLevels(levels) {
    try {
      localStorage.setItem(LEVELS_KEY, JSON.stringify(levels));
    } catch {}
  },

  loadLanguages() {
    try {
      const parsed = JSON.parse(localStorage.getItem(LANGUAGES_KEY));
      return parsed && typeof parsed === 'object' ? parsed : {};
    } catch {
      return {};
    }
  },

  loadTheme() {
    try {
      const theme = localStorage.getItem(THEME_KEY);
      return theme === 'dark' || theme === 'light' ? theme : null;
    } catch {
      return null;
    }
  },

  saveTheme(theme) {
    try {
      localStorage.setItem(THEME_KEY, theme);
    } catch {}
  },

  loadSound() {
    try {
      return localStorage.getItem(SOUND_KEY) !== 'off';
    } catch {
      return true;
    }
  },

  saveSound(enabled) {
    try {
      localStorage.setItem(SOUND_KEY, enabled ? 'on' : 'off');
    } catch {}
  },

  loadSidebarOpen() {
    try {
      return localStorage.getItem(SIDEBAR_KEY) !== 'closed';
    } catch {
      return true;
    }
  },

  saveSidebarOpen(open) {
    try {
      localStorage.setItem(SIDEBAR_KEY, open ? 'open' : 'closed');
    } catch {}
  },

  loadProgress() {
    try {
      const parsed = JSON.parse(localStorage.getItem(PROGRESS_KEY));
      return parsed && typeof parsed === 'object' ? parsed : null;
    } catch {
      return null;
    }
  },

  saveProgress(progress) {
    try {
      localStorage.setItem(PROGRESS_KEY, JSON.stringify(progress));
    } catch {}
  },

  loadBoards() {
    try {
      const raw = localStorage.getItem(BOARDS_KEY);
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) && parsed.length ? parsed : null;
    } catch {
      return null;
    }
  },

  saveBoards(boards) {
    try {
      localStorage.setItem(BOARDS_KEY, JSON.stringify(boards));
    } catch {}
  },

  loadProfile() {
    try {
      const parsed = JSON.parse(localStorage.getItem(PROFILE_KEY));
      return parsed && typeof parsed === 'object' ? parsed : null;
    } catch {
      return null;
    }
  },

  saveProfile(profile) {
    try {
      localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
    } catch {}
  },

  loadLastBoard() {
    try {
      return localStorage.getItem(LAST_BOARD_KEY);
    } catch {
      return null;
    }
  },

  saveLastBoard(id) {
    try {
      localStorage.setItem(LAST_BOARD_KEY, String(id));
    } catch {}
  },

  loadMemoryBest() {
    try {
      const parsed = JSON.parse(localStorage.getItem(MEMORY_BEST_KEY));
      return parsed && typeof parsed === 'object' ? parsed : {};
    } catch {
      return {};
    }
  },

  saveMemoryBest(records) {
    try {
      localStorage.setItem(MEMORY_BEST_KEY, JSON.stringify(records));
    } catch {}
  },

  loadMemorySeen() {
    try {
      const parsed = JSON.parse(localStorage.getItem(MEMORY_SEEN_KEY));
      return parsed && typeof parsed === 'object' ? parsed : {};
    } catch {
      return {};
    }
  },

  saveMemorySeen(records) {
    try {
      localStorage.setItem(MEMORY_SEEN_KEY, JSON.stringify(records));
    } catch {}
  },

  loadPlacement() {
    try {
      const parsed = JSON.parse(localStorage.getItem(PLACEMENT_KEY));
      return parsed && typeof parsed === 'object' ? parsed : {};
    } catch {
      return {};
    }
  },

  savePlacement(records) {
    try {
      localStorage.setItem(PLACEMENT_KEY, JSON.stringify(records));
    } catch {}
  },
};
