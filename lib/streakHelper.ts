import { supabase } from './supabase';

export async function updateStreak(userId: string): Promise<void> {
  try {
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (!profile) return;

    const today = new Date().toISOString().split('T')[0];
    const lastActivityDate = profile.last_activity_date;

    if (lastActivityDate === today) {
      return;
    }

    let newStreakCount = profile.streak_count;

    if (lastActivityDate) {
      const lastDate = new Date(lastActivityDate);
      const todayDate = new Date(today);
      const diffTime = todayDate.getTime() - lastDate.getTime();
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays === 1) {
        newStreakCount += 1;

        if (newStreakCount % 7 === 0) {
          await supabase.from('care_drops_transactions').insert({
            user_id: userId,
            amount: 50,
            transaction_type: 'streak_bonus',
            description: `7-day streak bonus! (Day ${newStreakCount})`,
          });

          await supabase
            .from('user_profiles')
            .update({
              care_drops: profile.care_drops + 50,
            })
            .eq('id', userId);
        }
      } else if (diffDays > 1) {
        newStreakCount = 1;
      }
    } else {
      newStreakCount = 1;
    }

    await supabase
      .from('user_profiles')
      .update({
        streak_count: newStreakCount,
        last_activity_date: today,
        updated_at: new Date().toISOString(),
      })
      .eq('id', userId);
  } catch (error) {
    console.error('Error updating streak:', error);
  }
}
