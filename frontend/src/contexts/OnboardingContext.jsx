import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { storage } from '../lib/storage.js';
import { AVATAR_GROUPS, avatarFor, normalizeAvatar } from '../lib/avatar.js';
import {
  AVATAR_OPTION_IDS,
  INTERESTS,
  INTEREST_IDS,
  OBJECTIVES,
  OBJECTIVE_IDS,
  SCHOOLING,
  SCHOOLING_IDS,
  cleanText,
  mascotFor,
  mascotStage,
  normalizeProfile,
  suggestSchooling,
} from '../lib/profile.js';

const OnboardingContext = createContext(null);

function formFromProfile(profile, schoolingTouched) {
  return {
    ...profile,
    interests: [...profile.interests],
    avatar: normalizeAvatar(profile.avatar),
    schoolingTouched,
  };
}

export function OnboardingProvider({ children }) {
  const [saved] = useState(() => storage.loadProfile?.() ?? null);
  const [profile, setProfile] = useState(() => normalizeProfile(saved));
  const hasProfile = Boolean(saved && profile.name && profile.age);

  const [step, setStep] = useState(hasProfile ? 4 : 1);
  const [visible, setVisible] = useState(!hasProfile);
  const [form, setForm] = useState(() => formFromProfile(normalizeProfile(saved), Boolean(saved)));
  const [error, setError] = useState('');

  const updateForm = useCallback((patch) => {
    setForm((current) => ({ ...current, ...patch }));
  }, []);

  const updateSchoolingSuggestion = useCallback(() => {
    setForm((current) =>
      current.schoolingTouched
        ? current
        : { ...current, schooling: suggestSchooling(current.age) }
    );
  }, []);

  const toggleInterest = useCallback((id) => {
    if (!INTEREST_IDS.has(id)) return;
    setForm((current) => {
      const list = current.interests || [];
      if (list.includes(id)) {
        return { ...current, interests: list.filter((item) => item !== id) };
      }
      if (list.length >= 3) return current;
      return { ...current, interests: [...list, id] };
    });
  }, []);

  const setAvatar = useCallback((groupId, optionId) => {
    const ids = AVATAR_OPTION_IDS.get(groupId);
    if (!ids || !ids.has(optionId)) return;
    setForm((current) => ({
      ...current,
      avatar: normalizeAvatar({ ...current.avatar, [groupId]: optionId }),
    }));
    setError('');
  }, []);

  const validate = useCallback(() => {
    const name = cleanText(form.name);
    const age = Number(form.age);
    if (name.length < 2) return 'Digite seu nome.';
    if (!Number.isInteger(age) || age < 3 || age > 100) return 'Digite uma idade entre 3 e 100 anos.';
    if (!OBJECTIVE_IDS.has(form.objective)) return 'Escolha seu objetivo.';
    if (!SCHOOLING_IDS.has(form.schooling)) return 'Escolha sua escolaridade.';
    return '';
  }, [form]);

  const persistForm = useCallback(() => {
    const next = normalizeProfile(form);
    setProfile(next);
    storage.saveProfile?.(next);
    setError('');
    return next;
  }, [form]);

  const submit = useCallback(() => {
    const message = validate();
    setError(message);
    if (message) return;
    persistForm();
    setStep(2);
  }, [persistForm, validate]);

  const confirmAvatar = useCallback(() => {
    persistForm();
    setStep(3);
  }, [persistForm]);

  const backToProfile = useCallback(() => {
    setStep(1);
    setError('');
  }, []);

  const backToAvatar = useCallback(() => {
    setStep(2);
    setError('');
  }, []);

  const choose = useCallback(() => {
    setVisible(false);
    setStep(4);
    setError('');
  }, []);

  const open = useCallback(() => {
    setForm(formFromProfile(profile, true));
    setStep(1);
    setError('');
    setVisible(true);
  }, [profile]);

  const close = useCallback(() => {
    setVisible(false);
    setError('');
  }, []);

  const value = useMemo(
    () => ({
      step,
      visible,
      objectives: OBJECTIVES,
      schoolingOptions: SCHOOLING,
      interestOptions: INTERESTS,
      avatarOptions: AVATAR_GROUPS,
      profile,
      form,
      error,

      mascot: avatarFor(profile) || mascotFor(profile.age),
      formMascot: avatarFor(form) || mascotFor(form.age),
      avatarPreview: avatarFor({ ...form, age: form.age, avatar: form.avatar }),

      updateForm,
      updateSchoolingSuggestion,
      toggleInterest,
      setAvatar,
      submit,
      confirmAvatar,
      backToProfile,
      backToAvatar,
      choose,
      open,
      close,
    }),
    [
      step,
      visible,
      profile,
      form,
      error,
      updateForm,
      updateSchoolingSuggestion,
      toggleInterest,
      setAvatar,
      submit,
      confirmAvatar,
      backToProfile,
      backToAvatar,
      choose,
      open,
      close,
    ]
  );

  return <OnboardingContext.Provider value={value}>{children}</OnboardingContext.Provider>;
}

export function useOnboarding() {
  const context = useContext(OnboardingContext);
  if (!context) throw new Error('useOnboarding must be used inside OnboardingProvider');
  return context;
}
