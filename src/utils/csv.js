export function toCsv(headers, rows) {
const esc = (v) => {
const s = v==null ? '' : String(v);
return (s.includes(',') || s.includes('"') || s.includes('\n')) ? '"'+s.replace(/"/g,'""')+'"' : s;
};
const head = headers.map(esc).join(',');
const body = rows.map(r=> r.map(esc).join(',')).join('\n');
return head + '\n' + body;
}