async function testPost() {
  console.log('--- TESTING POST TO VERCEL /api/sync ---');
  
  const testPayload = {
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
        id: 'teacher-test-999',
        name: 'Test Öğretmen',
        email: 'testogretmen@gmail.com',
        subject: 'Matematik',
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

  try {
    const res = await fetch('https://koc-one.vercel.app/api/sync', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(testPayload)
    });
    console.log('POST RESPONSE STATUS:', res.status);
    const json = await res.json();
    console.log('POST RESPONSE BODY:', JSON.stringify(json, null, 2));
  } catch (e) {
    console.error('POST FETCH ERROR:', e.message);
  }
}

testPost();
