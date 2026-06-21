export function courseProgress(course) {
  let totalLessons = 0;
  let completedLessons = 0;
  let completionDate = null;

  for (const moduleDoc of course.modules || []) {
    for (const lesson of moduleDoc.lessons || []) {
      totalLessons += 1;
      if (lesson.completedAt) {
        completedLessons += 1;
        if (!completionDate || new Date(lesson.completedAt) > new Date(completionDate)) {
          completionDate = lesson.completedAt;
        }
      }
    }
  }

  const percentage = totalLessons
    ? Math.round((completedLessons / totalLessons) * 100)
    : 0;

  return {
    completedLessons,
    completionDate,
    percentage,
    remainingLessons: totalLessons - completedLessons,
    totalLessons,
  };
}

export function nextIncompleteLesson(course) {
  for (const moduleDoc of course.modules || []) {
    for (const lesson of moduleDoc.lessons || []) {
      if (!lesson.completedAt) {
        return {
          ...lesson,
          moduleTitle: moduleDoc.title,
        };
      }
    }
  }

  return null;
}

export function mostRecentLesson(courses) {
  let recent = null;

  for (const course of courses) {
    for (const moduleDoc of course.modules || []) {
      for (const lesson of moduleDoc.lessons || []) {
        if (!lesson.lastOpenedAt) continue;
        if (!recent || new Date(lesson.lastOpenedAt) > new Date(recent.lastOpenedAt)) {
          recent = {
            ...lesson,
            courseId: course._id,
            courseTitle: course.title,
            moduleTitle: moduleDoc.title,
          };
        }
      }
    }
  }

  return recent;
}
