async function testLivePost() {
  console.log('--- TESTING LIVE POST TO VERCEL ---');
  const payload = {
    teachers: [
      {
        id: 'teacher-yasin-1',
        name: 'ADMİN',
        email: 'yasinalacahan23@gmail.com',
        subject: 'Fizik / Matematik',
        password: 'admin123',
        createdAt: '2026-07-25T10:00:00.000Z'
      },
      {
        id: 'teacher-fatma-100',
        name: 'Fatma Öğretmen',
        email: 'fatmao@gmail.com',
        subject: 'Biyoloji',
        password: '123',
        createdAt: new Date().toISOString()
      }
    ],
    students: [],
    lessons: [],
    homeworks: [],
    transactions: [],
    notifications: [],
    questions: []
  };

  const res = await fetch('https://koc-one.vercel.app/api/sync', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });

  console.log('STATUS:', res.status);
  const data = await res.json();
  console.log('RESPONSE:', JSON.stringify(data, null, 2));

  // Now GET again to verify!
  const getRes = await fetch('https://koc-one.vercel.app/api/sync');
  const getData = await getRes.json();
  console.log('VERIFIED CLOUD TEACHERS COUNT:', getData.teachers?.length);
  console.log('VERIFIED CLOUD TEACHERS:', JSON.stringify(getData.teachers, null, 2));
}

testLivePost();
