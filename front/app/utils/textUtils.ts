export function truncate(str: string, length?: number) {
  if (length && str.length > length) {
    return `${str.substring(0, length - 3)}...`;
  }
  return str;
}

export function stripHtml(html: string, maxLength?: number) {
  const tmp = document.createElement('DIV');
  tmp.innerHTML = html;
  const result = tmp.textContent || tmp.innerText || '';

  return truncate(result, maxLength);
}

export function validateSlug(slug: string) {
  // Default slug rules including arabic character ranges
  const slugRexEx = RegExp(
    /^[a-z0-9\u0600-\u06FF\u0750-\u077F]+(?:-[a-z0-9\u0600-\u06FF\u0750-\u077F]+)*$/
  );
  return slugRexEx.test(slug);
}
