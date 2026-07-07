export function imagePath(relativePath) {
  return relativePath;
}

export function renderImage(exercise, alt) {
  if (!exercise.image) {
    return `<div class="exercise-placeholder">${alt}</div>`;
  }
  const safeAlt = alt.replace(/'/g, "\\'");
  return `<img src="${imagePath(exercise.image)}" alt="${alt}" loading="lazy" onerror="this.replaceWith(Object.assign(document.createElement('div'),{className:'exercise-placeholder',textContent:'${safeAlt}'}))" />`;
}
