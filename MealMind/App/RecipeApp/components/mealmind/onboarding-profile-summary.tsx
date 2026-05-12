import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import type { ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { useI18n } from '@/contexts/i18n-context';
import {
  CALORIE_FOCUS_LABELS,
  COOKING_EXPERIENCE_LABELS,
  COOKING_SCHEDULE_LABELS,
  DIETARY_LABELS,
  SPICY_LEVEL_LABELS,
  WELLNESS_GOAL_LABELS,
} from '@/constants/onboarding-display-labels';
import { MealMindColors } from '@/constants/mealmind-colors';
import { MealMindRadii, MealMindShadow, MealMindSpace } from '@/constants/mealmind-layout';
import { MealMindFonts } from '@/constants/mealmind-typography';
import type { StoredProfile } from '@/lib/profile-storage';

function Chip({ label }: { label: string }) {
  return (
    <View style={styles.chip}>
      <Text style={styles.chipText}>{label}</Text>
    </View>
  );
}

function ChipRow({ items, emptyLabel }: { items: string[]; emptyLabel: string }) {
  if (items.length === 0) {
    return <Text style={styles.emptyLine}>{emptyLabel}</Text>;
  }
  return (
    <View style={styles.chipWrap}>
      {items.map((x) => (
        <Chip key={x} label={x} />
      ))}
    </View>
  );
}

function Section({
  step,
  title,
  subtitle,
  icon,
  children,
}: {
  step: string;
  title: string;
  subtitle?: string;
  icon: keyof typeof MaterialIcons.glyphMap;
  children: ReactNode;
}) {
  return (
    <View style={styles.card}>
      <View style={styles.cardHead}>
        <View style={styles.iconWell}>
          <MaterialIcons name={icon} size={20} color={MealMindColors.onPrimaryFixedVariant} />
        </View>
        <View style={styles.cardHeadText}>
          <Text style={styles.kicker}>{step}</Text>
          <Text style={styles.cardTitle}>{title}</Text>
          {subtitle ? <Text style={styles.cardSub}>{subtitle}</Text> : null}
        </View>
      </View>
      {children}
    </View>
  );
}

function AnswerLine({ text }: { text: string }) {
  return (
    <View style={styles.answerRow}>
      <MaterialIcons name="fiber-manual-record" size={10} color={MealMindColors.primary} style={styles.bullet} />
      <Text style={styles.answerText}>{text}</Text>
    </View>
  );
}

export function OnboardingProfileSummary({
  profile,
  embedded = false,
}: {
  profile: StoredProfile;
  /** When nested under Profile "details", hide the duplicated hero headline. */
  embedded?: boolean;
}) {
  const { t } = useI18n();

  const none = t('onboarding.noneSelected');

  return (
    <View style={styles.root}>
      {!embedded ? (
        <View style={styles.hero}>
          <Text style={styles.heroKicker}>{t('onboarding.summaryKicker')}</Text>
          <Text style={styles.heroTitle}>{t('onboarding.summaryTitle')}</Text>
          <Text style={styles.heroSub}>{t('onboarding.summarySub')}</Text>
        </View>
      ) : null}

      <Section step={t('onboarding.stepOf', { n: 1, total: 12 })} title={t('onboarding.summaryGoal')} icon="flag">
        <AnswerLine text={WELLNESS_GOAL_LABELS[profile.wellnessGoal]} />
      </Section>

      <Section step={t('onboarding.stepOf', { n: 2, total: 12 })} title={t('onboarding.summaryDiet')} icon="restaurant-menu">
        <AnswerLine text={DIETARY_LABELS[profile.dietaryPreference]} />
      </Section>

      <Section step={t('onboarding.stepOf', { n: 3, total: 12 })} title={t('onboarding.summaryCuisines')} icon="public">
        <ChipRow items={profile.cuisines} emptyLabel={none} />
      </Section>

      <Section step={t('onboarding.stepOf', { n: 4, total: 12 })} title={t('onboarding.summaryAllergies')} icon="warning" subtitle={t('onboarding.summarySafety')}>
        <ChipRow items={profile.allergies} emptyLabel={none} />
      </Section>

      <Section step={t('onboarding.stepOf', { n: 5, total: 12 })} title={t('onboarding.summaryAvoidFoods')} icon="block">
        <ChipRow items={profile.avoidFoods} emptyLabel={none} />
      </Section>

      <Section step={t('onboarding.stepOf', { n: 6, total: 12 })} title={t('onboarding.summaryDislikes')} icon="sentiment-dissatisfied">
        <ChipRow items={profile.dislikes} emptyLabel={none} />
      </Section>

      <Section step={t('onboarding.stepOf', { n: 7, total: 12 })} title={t('onboarding.summaryExperience')} icon="outdoor-grill">
        <AnswerLine text={COOKING_EXPERIENCE_LABELS[profile.cookingExperience]} />
      </Section>

      <Section step={t('onboarding.stepOf', { n: 8, total: 12 })} title={t('onboarding.summaryEquipment')} icon="countertops">
        <ChipRow items={profile.kitchenEquipment} emptyLabel={none} />
      </Section>

      <Section step={t('onboarding.stepOf', { n: 9, total: 12 })} title={t('onboarding.summarySchedule')} icon="calendar-today">
        <AnswerLine text={COOKING_SCHEDULE_LABELS[profile.cookingSchedule] ?? profile.cookingSchedule} />
      </Section>

      <Section step={t('onboarding.stepOf', { n: 10, total: 12 })} title={t('onboarding.summaryFlavors')} icon="local-dining">
        <ChipRow items={profile.flavorProfile.map((f) => f.charAt(0).toUpperCase() + f.slice(1))} emptyLabel={none} />
      </Section>

      <Section step={t('onboarding.stepOf', { n: 11, total: 12 })} title={t('onboarding.summarySpice')} icon="whatshot">
        <AnswerLine text={SPICY_LEVEL_LABELS[profile.spicyLevel]} />
      </Section>

      <Section step={t('onboarding.stepOf', { n: 12, total: 12 })} title={t('onboarding.summaryCalories')} icon="balance">
        <AnswerLine text={CALORIE_FOCUS_LABELS[profile.calorieFocus]} />
      </Section>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { gap: MealMindSpace.md },
  hero: {
    gap: MealMindSpace.sm,
    marginBottom: MealMindSpace.sm,
  },
  heroKicker: {
    fontFamily: MealMindFonts.labelSemibold,
    fontSize: 11,
    letterSpacing: 2,
    color: MealMindColors.primary,
  },
  heroTitle: {
    fontFamily: MealMindFonts.headlineBold,
    fontSize: 22,
    letterSpacing: -0.4,
    color: MealMindColors.onSurface,
  },
  heroSub: {
    fontFamily: MealMindFonts.body,
    fontSize: 15,
    lineHeight: 22,
    color: MealMindColors.onSurfaceVariant,
  },
  card: {
    backgroundColor: MealMindColors.surfaceContainerLowest,
    borderRadius: MealMindRadii.md,
    padding: MealMindSpace.lg,
    gap: MealMindSpace.md,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: `${MealMindColors.outlineVariant}33`,
    ...MealMindShadow.ambient,
  },
  cardHead: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: MealMindSpace.md,
  },
  iconWell: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: MealMindColors.primaryFixed,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardHeadText: { flex: 1, gap: 4 },
  kicker: {
    fontFamily: MealMindFonts.labelSemibold,
    fontSize: 10,
    letterSpacing: 1.2,
    color: MealMindColors.outline,
    textTransform: 'uppercase',
  },
  cardTitle: {
    fontFamily: MealMindFonts.headlineBold,
    fontSize: 17,
    color: MealMindColors.onSurface,
  },
  cardSub: {
    fontFamily: MealMindFonts.body,
    fontSize: 13,
    color: MealMindColors.onSurfaceVariant,
    lineHeight: 18,
  },
  answerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 4,
  },
  bullet: { marginTop: 2 },
  answerText: {
    flex: 1,
    fontFamily: MealMindFonts.bodyMedium,
    fontSize: 15,
    color: MealMindColors.onSurface,
  },
  chipWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: MealMindSpace.sm,
  },
  chip: {
    paddingHorizontal: MealMindSpace.md,
    paddingVertical: 8,
    borderRadius: MealMindRadii.full,
    backgroundColor: MealMindColors.secondaryContainer,
  },
  chipText: {
    fontFamily: MealMindFonts.bodyMedium,
    fontSize: 13,
    color: MealMindColors.onSecondaryContainer,
  },
  emptyLine: {
    fontFamily: MealMindFonts.body,
    fontSize: 14,
    color: MealMindColors.onSurfaceVariant,
    fontStyle: 'italic',
  },
});
