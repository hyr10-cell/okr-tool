# OKR 웹앱 구현 계획

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 팀원 레포(hyr10-cell/okr-tool)를 기반으로 OKR 성과관리 웹앱 MVP를 완성한다.

**Architecture:** Next.js 16 App Router + Prisma ORM + PostgreSQL. 역할은 ADMIN/REVIEWER/MEMBER 3단계. 리뷰어-담당자 관계는 User.reviewerId 필드로 표현. Slack은 알림 전용(내용 포함).

**Tech Stack:** Next.js 16, TypeScript, Tailwind CSS, Prisma, PostgreSQL, NextAuth v5, @slack/web-api, zod

---

## 전제조건 (개발 시작 전 Jay가 확인)

- [ ] 개발실에서 PostgreSQL 접속 정보 수령: host, port, DB명, user, password
- [ ] Slack Bot Token 발급 (Slack 앱 생성 → Bot Token 복사)
- [ ] 레포 클론 및 `npm install` 완료

---

## 파일 구조

```
prisma/
  schema.prisma          ← 역할 리네이밍, reviewerId 추가 (수정)

lib/
  auth.ts                ← DB 인증 활성화, REVIEWER 역할 반영 (수정)
  prisma.ts              ← 기존 유지
  slack.ts               ← Slack 알림 헬퍼 (신규)
  csv-parser.ts          ← CSV 조직도 파서 (신규)

app/
  (auth)/login/page.tsx  ← 기존 유지 (데모 계정 제거는 나중에)
  (main)/
    layout.tsx           ← 사이드바 네비 수정 (수정)
    goals/
      page.tsx           ← 목표 목록 (수정)
      [id]/
        page.tsx         ← 목표 상세 + 체크인 히스토리 (신규)
        checkin/
          page.tsx       ← 체크인 폼 (신규)
    dashboard/
      page.tsx           ← 리뷰어 대시보드 (전면 재작성)
    admin/
      page.tsx           ← 관리자 홈 (신규)
      members/
        page.tsx         ← 멤버 목록 + 역할 설정 (신규)
      org-upload/
        page.tsx         ← CSV 업로드 (신규)
      cycles/
        page.tsx         ← 사이클 관리 (신규)

  api/
    goals/
      route.ts           ← 목표 CRUD (수정)
      [id]/
        route.ts         ← 목표 상세/수정/삭제 (신규)
        checkins/
          route.ts       ← 체크인 목록/생성 (신규)
          [checkinId]/
            comments/
              route.ts   ← 코멘트 목록/생성 (신규)
    admin/
      members/
        route.ts         ← 멤버 목록/역할 변경 (신규)
      org-upload/
        route.ts         ← CSV 파싱 및 저장 (신규)
      cycles/
        route.ts         ← 사이클 CRUD (신규)
```

---

## Task 1: PostgreSQL 연결 + DB 스키마 업데이트

**목적:** demo 모드 → 실제 DB 연결. 역할 MANAGER→REVIEWER, reviewerId 추가.

**Files:**
- Modify: `prisma/schema.prisma`
- Modify: `.env` (신규 생성)
- Modify: `lib/prisma.ts`

- [ ] **Step 1: .env 파일 생성**

프로젝트 루트에 `.env` 파일 생성:

```env
DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DBNAME"
NEXTAUTH_SECRET="임의의-긴-문자열-여기에-입력"
NEXTAUTH_URL="http://localhost:3000"
SLACK_BOT_TOKEN=""
```

> ⚠️ DATABASE_URL은 개발실에서 받은 실제 정보로 교체. NEXTAUTH_SECRET는 터미널에서 `openssl rand -base64 32` 실행하여 생성.

- [ ] **Step 2: .gitignore에 .env 추가 확인**

```bash
cat .gitignore | grep ".env"
```

없으면 `.gitignore`에 `.env` 추가:
```
.env
.env.local
```

- [ ] **Step 3: schema.prisma 업데이트**

`prisma/schema.prisma` 상단 datasource 블록 교체:

```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

Role enum 수정 (MANAGER → REVIEWER):

```prisma
enum Role {
  ADMIN
  REVIEWER
  MEMBER
}
```

User 모델에 reviewerId 추가 (기존 User 모델에서 `role` 필드 아래에 삽입):

```prisma
model User {
  id          String   @id @default(cuid())
  email       String   @unique
  name        String
  role        Role     @default(MEMBER)
  reviewerId  String?
  reviewer    User?    @relation("ReviewerRelation", fields: [reviewerId], references: [id])
  reviewees   User[]   @relation("ReviewerRelation")
  // ... 기존 나머지 필드 유지
}
```

- [ ] **Step 4: Prisma 의존성 추가 및 마이그레이션**

```bash
npm install @prisma/client
npx prisma migrate dev --name "init-postgresql-reviewer-role"
```

Expected: `Your database is now in sync with your schema.`

- [ ] **Step 5: lib/prisma.ts 확인**

파일 내용이 아래와 같은지 확인 (이미 올바르면 변경 불필요):

```typescript
import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: ['error'],
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
```

- [ ] **Step 6: 연결 테스트**

```bash
npx prisma studio
```

Expected: 브라우저에서 DB 테이블 목록 확인 가능.

- [ ] **Step 7: Commit**

```bash
git add prisma/schema.prisma lib/prisma.ts .gitignore
git commit -m "feat: PostgreSQL 연결 및 REVIEWER 역할 스키마 업데이트"
```

---

## Task 2: 인증 시스템 정비

**목적:** NextAuth를 실제 DB 기반으로 전환. REVIEWER 역할 반영.

**Files:**
- Modify: `lib/auth.ts`

- [ ] **Step 1: lib/auth.ts 전체 교체**

```typescript
import NextAuth, { type DefaultSession } from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import { prisma } from './prisma';

declare module 'next-auth' {
  interface Session extends DefaultSession {
    user: DefaultSession['user'] & {
      id: string;
      role: 'ADMIN' | 'REVIEWER' | 'MEMBER';
    };
  }
}

export const { auth, handlers, signIn, signOut } = NextAuth({
  providers: [
    Credentials({
      credentials: {
        email: { label: '이메일', type: 'email' },
      },
      async authorize(credentials) {
        if (!credentials?.email) return null;
        const email = credentials.email as string;

        try {
          const user = await prisma.user.findUnique({
            where: { email },
          });
          if (!user) return null;
          return { id: user.id, email: user.email, name: user.name, role: user.role };
        } catch {
          return null;
        }
      },
    }),
  ],
  pages: { signIn: '/login' },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = (user as any).id;
        token.role = (user as any).role;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as 'ADMIN' | 'REVIEWER' | 'MEMBER';
      }
      return session;
    },
  },
});
```

- [ ] **Step 2: 관리자 계정 시드 데이터 생성**

`prisma/seed.ts` 파일 생성:

```typescript
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  await prisma.user.upsert({
    where: { email: 'jay.ko@wincubemkt.com' },
    update: {},
    create: {
      email: 'jay.ko@wincubemkt.com',
      name: 'Jay (고종희)',
      role: 'ADMIN',
    },
  });

  await prisma.user.upsert({
    where: { email: 'hyr10@wincubemkt.com' },  // 황유리 선임 이메일로 교체
    update: {},
    create: {
      email: 'hyr10@wincubemkt.com',
      name: '황유리',
      role: 'ADMIN',
    },
  });

  console.log('시드 완료');
}

main().catch(console.error).finally(() => prisma.$disconnect());
```

> ⚠️ 황유리 선임의 실제 회사 이메일로 교체 필요.

- [ ] **Step 3: package.json에 seed 스크립트 추가**

`package.json`의 `scripts`에 추가:

```json
"db:seed": "ts-node prisma/seed.ts"
```

- [ ] **Step 4: 시드 실행**

```bash
npm run db:seed
```

Expected: `시드 완료`

- [ ] **Step 5: 개발 서버 실행 및 로그인 테스트**

```bash
npm run dev
```

브라우저에서 `http://localhost:3000` 접속 → jay.ko@wincubemkt.com으로 로그인 → `/goals` 이동 확인.

- [ ] **Step 6: Commit**

```bash
git add lib/auth.ts prisma/seed.ts package.json
git commit -m "feat: DB 기반 인증 전환 및 관리자 계정 시드"
```

---

## Task 3: 목표 API 완성

**목적:** 목표 CRUD API를 실제 DB 기반으로 완성.

**Files:**
- Modify: `app/api/goals/route.ts`
- Create: `app/api/goals/[id]/route.ts`

- [ ] **Step 1: app/api/goals/route.ts 전체 교체**

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const CreateGoalSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  level: z.enum(['COMPANY', 'TEAM', 'INDIVIDUAL']),
  cycleId: z.string(),
  metricType: z.enum(['NUMBER', 'BOOLEAN']).default('NUMBER'),
  targetValue: z.number().optional(),
});

export async function GET() {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: '인증 필요' }, { status: 401 });

  const goals = await prisma.goal.findMany({
    where: {
      ownerId: session.user.id,
      deletedAt: null,
    },
    include: {
      owner: { select: { id: true, name: true } },
      cycle: { select: { id: true, name: true } },
      checkIns: {
        orderBy: { createdAt: 'desc' },
        take: 1,
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  return NextResponse.json({ data: goals });
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: '인증 필요' }, { status: 401 });

  const body = await req.json();
  const parsed = CreateGoalSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const owner = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { reviewerId: true },
  });

  const goal = await prisma.goal.create({
    data: {
      title: parsed.data.title,
      description: parsed.data.description,
      level: parsed.data.level,
      cycleId: parsed.data.cycleId,
      ownerId: session.user.id,
      status: 'PENDING',
    },
  });

  return NextResponse.json({ data: goal }, { status: 201 });
}
```

- [ ] **Step 2: app/api/goals/[id]/route.ts 생성**

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(_: NextRequest, { params }: { params: { id: string } }) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: '인증 필요' }, { status: 401 });

  const goal = await prisma.goal.findUnique({
    where: { id: params.id, deletedAt: null },
    include: {
      owner: { select: { id: true, name: true, reviewerId: true } },
      cycle: { select: { id: true, name: true } },
      checkIns: {
        orderBy: { createdAt: 'desc' },
        include: {
          comments: {
            include: { author: { select: { id: true, name: true } } },
            orderBy: { createdAt: 'asc' },
          },
        },
      },
    },
  });

  if (!goal) return NextResponse.json({ error: '목표 없음' }, { status: 404 });

  const isOwner = goal.ownerId === session.user.id;
  const isReviewer = goal.owner.reviewerId === session.user.id;
  const isAdmin = session.user.role === 'ADMIN';

  if (!isOwner && !isReviewer && !isAdmin) {
    return NextResponse.json({ error: '권한 없음' }, { status: 403 });
  }

  return NextResponse.json({ data: goal });
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: '인증 필요' }, { status: 401 });

  const goal = await prisma.goal.findUnique({
    where: { id: params.id, deletedAt: null },
  });

  if (!goal) return NextResponse.json({ error: '목표 없음' }, { status: 404 });
  if (goal.ownerId !== session.user.id && session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: '권한 없음' }, { status: 403 });
  }

  const body = await req.json();
  const updated = await prisma.goal.update({
    where: { id: params.id },
    data: {
      title: body.title,
      description: body.description,
      status: body.status,
    },
  });

  return NextResponse.json({ data: updated });
}
```

- [ ] **Step 3: 개발 서버에서 API 테스트**

```bash
# 터미널에서 실행 (서버가 켜져 있어야 함)
curl -X GET http://localhost:3000/api/goals \
  -H "Cookie: next-auth.session-token=..." 
```

Expected: `{"data": []}` (빈 배열, 오류 없음)

- [ ] **Step 4: Commit**

```bash
git add app/api/goals/route.ts app/api/goals/[id]/route.ts
git commit -m "feat: 목표 CRUD API (DB 기반)"
```

---

## Task 4: 체크인 API + 코멘트 API

**목적:** 담당자 체크인 제출, 리뷰어 코멘트 API.

**Files:**
- Create: `app/api/goals/[id]/checkins/route.ts`
- Create: `app/api/goals/[id]/checkins/[checkinId]/comments/route.ts`
- Create: `lib/slack.ts`

- [ ] **Step 1: lib/slack.ts 생성**

```typescript
import { WebClient } from '@slack/web-api';

const slack = process.env.SLACK_BOT_TOKEN
  ? new WebClient(process.env.SLACK_BOT_TOKEN)
  : null;

export async function sendSlackDM(userEmail: string, text: string): Promise<void> {
  if (!slack) return;
  try {
    const user = await slack.users.lookupByEmail({ email: userEmail });
    if (!user.user?.id) return;
    await slack.chat.postMessage({ channel: user.user.id, text });
  } catch (e) {
    console.error('Slack 알림 실패:', e);
  }
}
```

- [ ] **Step 2: package.json에 @slack/web-api 추가**

```bash
npm install @slack/web-api
```

- [ ] **Step 3: app/api/goals/[id]/checkins/route.ts 생성**

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { sendSlackDM } from '@/lib/slack';
import { z } from 'zod';

const CheckInSchema = z.object({
  progress: z.number().min(0).max(100),
  status: z.enum(['ON_TRACK', 'OFF_TRACK']),
  note: z.string().optional(),
});

export async function GET(_: NextRequest, { params }: { params: { id: string } }) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: '인증 필요' }, { status: 401 });

  const checkIns = await prisma.checkIn.findMany({
    where: { goalId: params.id },
    include: {
      comments: {
        include: { author: { select: { id: true, name: true } } },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  return NextResponse.json({ data: checkIns });
}

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: '인증 필요' }, { status: 401 });

  const goal = await prisma.goal.findUnique({
    where: { id: params.id },
    include: {
      owner: { select: { id: true, name: true, email: true, reviewerId: true } },
    },
  });

  if (!goal) return NextResponse.json({ error: '목표 없음' }, { status: 404 });
  if (goal.ownerId !== session.user.id) {
    return NextResponse.json({ error: '담당자만 체크인 가능' }, { status: 403 });
  }

  const body = await req.json();
  const parsed = CheckInSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const checkIn = await prisma.checkIn.create({
    data: {
      goalId: params.id,
      authorId: session.user.id,
      progress: parsed.data.progress,
      status: parsed.data.status,
      note: parsed.data.note,
    },
  });

  // 목표 상태 업데이트
  await prisma.goal.update({
    where: { id: params.id },
    data: { status: parsed.data.status },
  });

  // 리뷰어에게 Slack 알림
  if (goal.owner.reviewerId) {
    const reviewer = await prisma.user.findUnique({
      where: { id: goal.owner.reviewerId },
      select: { email: true },
    });
    if (reviewer) {
      const statusLabel = parsed.data.status === 'ON_TRACK' ? '순항' : '난항';
      const noteText = parsed.data.note ? `\n📝 ${parsed.data.note}` : '';
      await sendSlackDM(
        reviewer.email,
        `📊 *[체크인 알림]* ${goal.owner.name}님이 "${goal.title}" 체크인을 제출했습니다.\n진행률: ${parsed.data.progress}% (${statusLabel})${noteText}\n👉 확인하기: ${process.env.NEXTAUTH_URL}/goals/${goal.id}`
      );
    }
  }

  return NextResponse.json({ data: checkIn }, { status: 201 });
}
```

- [ ] **Step 4: app/api/goals/[id]/checkins/[checkinId]/comments/route.ts 생성**

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { sendSlackDM } from '@/lib/slack';

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string; checkinId: string } }
) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: '인증 필요' }, { status: 401 });

  const body = await req.json();
  if (!body.content?.trim()) {
    return NextResponse.json({ error: '코멘트 내용 필요' }, { status: 400 });
  }

  const checkIn = await prisma.checkIn.findUnique({
    where: { id: params.checkinId },
    include: {
      goal: {
        include: {
          owner: { select: { id: true, email: true, name: true } },
        },
      },
    },
  });

  if (!checkIn) return NextResponse.json({ error: '체크인 없음' }, { status: 404 });

  // 리뷰어 또는 관리자만 코멘트 가능
  const owner = checkIn.goal.owner;
  const reviewer = await prisma.user.findFirst({
    where: { id: owner.id },
    select: { reviewerId: true },
  });

  const isReviewer = reviewer?.reviewerId === session.user.id;
  const isAdmin = session.user.role === 'ADMIN';

  if (!isReviewer && !isAdmin) {
    return NextResponse.json({ error: '리뷰어만 코멘트 가능' }, { status: 403 });
  }

  const comment = await prisma.comment.create({
    data: {
      checkInId: params.checkinId,
      authorId: session.user.id,
      content: body.content,
    },
    include: { author: { select: { id: true, name: true } } },
  });

  // 담당자에게 Slack 알림 (코멘트 전문 포함)
  await sendSlackDM(
    owner.email,
    `💬 *[코멘트 알림]* ${comment.author.name}님이 "${checkIn.goal.title}" 체크인에 코멘트를 남겼습니다.\n"${body.content}"\n👉 확인하기: ${process.env.NEXTAUTH_URL}/goals/${params.id}`
  );

  return NextResponse.json({ data: comment }, { status: 201 });
}
```

> ⚠️ Prisma 스키마에 `Comment` 모델이 없으면 아래를 `schema.prisma`에 추가:
> ```prisma
> model Comment {
>   id         String   @id @default(cuid())
>   checkInId  String
>   checkIn    CheckIn  @relation(fields: [checkInId], references: [id])
>   authorId   String
>   author     User     @relation(fields: [authorId], references: [id])
>   content    String
>   createdAt  DateTime @default(now())
> }
> ```
> 추가 후 `npx prisma migrate dev --name "add-comment"` 실행.

- [ ] **Step 5: Commit**

```bash
git add lib/slack.ts app/api/goals/[id]/checkins/ package.json package-lock.json
git commit -m "feat: 체크인·코멘트 API + Slack 알림"
```

---

## Task 5: 관리자 API (멤버·사이클·CSV 업로드)

**목적:** 관리자가 멤버 관리, CSV 조직도 업로드, 사이클 생성을 할 수 있는 API.

**Files:**
- Create: `lib/csv-parser.ts`
- Create: `app/api/admin/members/route.ts`
- Create: `app/api/admin/org-upload/route.ts`
- Create: `app/api/admin/cycles/route.ts`

- [ ] **Step 1: lib/csv-parser.ts 생성**

CSV 컬럼 형식: `이름,이메일,부서,직책,리뷰어이메일`

```typescript
export interface OrgRow {
  name: string;
  email: string;
  department: string;
  title: string;
  reviewerEmail: string;
}

export function parseOrgCSV(csvText: string): OrgRow[] {
  const lines = csvText.trim().split('\n');
  const dataLines = lines[0].startsWith('이름') ? lines.slice(1) : lines;

  return dataLines
    .map((line) => {
      const [name, email, department, title, reviewerEmail] = line.split(',').map((s) => s.trim());
      return { name, email, department, title, reviewerEmail };
    })
    .filter((row) => row.email && row.name);
}
```

- [ ] **Step 2: app/api/admin/members/route.ts 생성**

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

async function requireAdmin() {
  const session = await auth();
  if (!session?.user || session.user.role !== 'ADMIN') return null;
  return session;
}

export async function GET() {
  if (!await requireAdmin()) return NextResponse.json({ error: '관리자 전용' }, { status: 403 });

  const members = await prisma.user.findMany({
    select: {
      id: true, name: true, email: true, role: true,
      reviewer: { select: { id: true, name: true } },
    },
    orderBy: { name: 'asc' },
  });

  return NextResponse.json({ data: members });
}

export async function PATCH(req: NextRequest) {
  if (!await requireAdmin()) return NextResponse.json({ error: '관리자 전용' }, { status: 403 });

  const body = await req.json();
  const { userId, role, reviewerId } = body;

  const updated = await prisma.user.update({
    where: { id: userId },
    data: {
      ...(role && { role }),
      ...(reviewerId !== undefined && { reviewerId }),
    },
  });

  return NextResponse.json({ data: updated });
}
```

- [ ] **Step 3: app/api/admin/org-upload/route.ts 생성**

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { parseOrgCSV } from '@/lib/csv-parser';

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: '관리자 전용' }, { status: 403 });
  }

  const formData = await req.formData();
  const file = formData.get('file') as File;
  if (!file) return NextResponse.json({ error: '파일 필요' }, { status: 400 });

  const text = await file.text();
  const rows = parseOrgCSV(text);

  let created = 0;
  let updated = 0;

  for (const row of rows) {
    const reviewer = row.reviewerEmail
      ? await prisma.user.findUnique({ where: { email: row.reviewerEmail } })
      : null;

    const existing = await prisma.user.findUnique({ where: { email: row.email } });

    if (existing) {
      await prisma.user.update({
        where: { email: row.email },
        data: {
          name: row.name,
          ...(reviewer && { reviewerId: reviewer.id }),
        },
      });
      updated++;
    } else {
      await prisma.user.create({
        data: {
          email: row.email,
          name: row.name,
          role: 'MEMBER',
          ...(reviewer && { reviewerId: reviewer.id }),
        },
      });
      created++;
    }
  }

  return NextResponse.json({ data: { created, updated, total: rows.length } });
}
```

- [ ] **Step 4: app/api/admin/cycles/route.ts 생성**

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const CycleSchema = z.object({
  name: z.string().min(1),
  startDate: z.string(),
  endDate: z.string(),
});

export async function GET() {
  const session = await auth();
  if (!session?.user || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: '관리자 전용' }, { status: 403 });
  }

  const cycles = await prisma.goalCycle.findMany({ orderBy: { startDate: 'desc' } });
  return NextResponse.json({ data: cycles });
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: '관리자 전용' }, { status: 403 });
  }

  const body = await req.json();
  const parsed = CycleSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const cycle = await prisma.goalCycle.create({
    data: {
      name: parsed.data.name,
      startDate: new Date(parsed.data.startDate),
      endDate: new Date(parsed.data.endDate),
    },
  });

  return NextResponse.json({ data: cycle }, { status: 201 });
}
```

- [ ] **Step 5: Commit**

```bash
git add lib/csv-parser.ts app/api/admin/
git commit -m "feat: 관리자 API (멤버·사이클·CSV 업로드)"
```

---

## Task 6: 목표 목록 UI + 목표 상세 UI

**목적:** 담당자가 목표를 보고 등록할 수 있는 화면.

**Files:**
- Modify: `app/(main)/goals/page.tsx`
- Create: `app/(main)/goals/[id]/page.tsx`

- [ ] **Step 1: app/(main)/goals/page.tsx 전체 교체**

```typescript
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface Goal {
  id: string;
  title: string;
  status: string;
  owner: { name: string };
  level: string;
  checkIns: { progress: number; status: string }[];
}

const STATUS_LABEL: Record<string, string> = {
  PENDING: '대기', ON_TRACK: '순항', OFF_TRACK: '난항', COMPLETED: '완료', STOPPED: '중단',
};
const STATUS_COLOR: Record<string, string> = {
  PENDING: 'bg-gray-100 text-gray-700',
  ON_TRACK: 'bg-green-100 text-green-700',
  OFF_TRACK: 'bg-red-100 text-red-700',
  COMPLETED: 'bg-blue-100 text-blue-700',
  STOPPED: 'bg-gray-200 text-gray-500',
};

export default function GoalsPage() {
  const router = useRouter();
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL');

  useEffect(() => { fetchGoals(); }, []);

  async function fetchGoals() {
    const res = await fetch('/api/goals');
    if (res.ok) {
      const data = await res.json();
      setGoals(data.data || []);
    }
    setLoading(false);
  }

  const filtered = filter === 'ALL' ? goals : goals.filter(g => g.status === filter);

  if (loading) return <div className="text-center py-12 text-gray-500">로드 중...</div>;

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">나의 목표</h1>
        <button
          onClick={() => router.push('/goals/new')}
          className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
        >
          + 새 목표
        </button>
      </div>

      <div className="flex gap-2 mb-4">
        {['ALL', 'ON_TRACK', 'OFF_TRACK', 'PENDING', 'COMPLETED'].map(s => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`px-3 py-1 rounded-full text-xs font-medium border transition ${
              filter === s ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-gray-600 border-gray-300 hover:border-indigo-400'
            }`}
          >
            {s === 'ALL' ? '전체' : STATUS_LABEL[s]}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-lg border border-gray-200 bg-gray-50 p-12 text-center text-gray-500">
          목표가 없습니다.
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((goal) => {
            const progress = goal.checkIns[0]?.progress ?? 0;
            return (
              <div
                key={goal.id}
                onClick={() => router.push(`/goals/${goal.id}`)}
                className="rounded-lg border border-gray-200 bg-white p-5 hover:shadow-md transition cursor-pointer"
              >
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-gray-900">{goal.title}</h3>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${STATUS_COLOR[goal.status]}`}>
                    {STATUS_LABEL[goal.status]}
                  </span>
                </div>
                <div className="mt-3">
                  <div className="flex justify-between text-xs text-gray-500 mb-1">
                    <span>진행률</span>
                    <span>{progress}%</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-1.5">
                    <div
                      className={`h-1.5 rounded-full ${goal.status === 'OFF_TRACK' ? 'bg-red-500' : 'bg-indigo-500'}`}
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 2: app/(main)/goals/[id]/page.tsx 생성**

```typescript
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface CheckIn {
  id: string;
  progress: number;
  status: string;
  note?: string;
  createdAt: string;
  comments: { id: string; content: string; author: { name: string }; createdAt: string }[];
}

interface Goal {
  id: string;
  title: string;
  description?: string;
  status: string;
  level: string;
  owner: { name: string };
  cycle?: { name: string };
  checkIns: CheckIn[];
}

const STATUS_LABEL: Record<string, string> = {
  PENDING: '대기', ON_TRACK: '순항', OFF_TRACK: '난항', COMPLETED: '완료',
};

export default function GoalDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [goal, setGoal] = useState<Goal | null>(null);
  const [loading, setLoading] = useState(true);
  const [comment, setComment] = useState('');
  const [activeCheckinId, setActiveCheckinId] = useState<string | null>(null);

  useEffect(() => { fetchGoal(); }, []);

  async function fetchGoal() {
    const res = await fetch(`/api/goals/${params.id}`);
    if (res.ok) {
      const data = await res.json();
      setGoal(data.data);
    }
    setLoading(false);
  }

  async function submitComment(checkinId: string) {
    if (!comment.trim()) return;
    await fetch(`/api/goals/${params.id}/checkins/${checkinId}/comments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content: comment }),
    });
    setComment('');
    setActiveCheckinId(null);
    fetchGoal();
  }

  if (loading) return <div className="text-center py-12 text-gray-500">로드 중...</div>;
  if (!goal) return <div className="text-center py-12 text-gray-500">목표를 찾을 수 없습니다.</div>;

  const latestProgress = goal.checkIns[0]?.progress ?? 0;

  return (
    <div className="max-w-2xl">
      <button onClick={() => router.back()} className="text-sm text-gray-500 hover:text-gray-700 mb-4 flex items-center gap-1">
        ← 목록으로
      </button>

      <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
        <div className="flex items-start justify-between mb-2">
          <h1 className="text-xl font-bold text-gray-900">{goal.title}</h1>
          <span className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-600">{STATUS_LABEL[goal.status]}</span>
        </div>
        {goal.description && <p className="text-gray-600 text-sm mb-4">{goal.description}</p>}

        <div className="flex gap-4 text-xs text-gray-500 mb-4">
          <span>담당: {goal.owner.name}</span>
          {goal.cycle && <span>사이클: {goal.cycle.name}</span>}
        </div>

        <div>
          <div className="flex justify-between text-xs text-gray-500 mb-1">
            <span>전체 진행률</span><span>{latestProgress}%</span>
          </div>
          <div className="w-full bg-gray-100 rounded-full h-2">
            <div className="h-2 rounded-full bg-indigo-500" style={{ width: `${latestProgress}%` }} />
          </div>
        </div>

        <button
          onClick={() => router.push(`/goals/${goal.id}/checkin`)}
          className="mt-4 w-full rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
        >
          체크인 작성
        </button>
      </div>

      <h2 className="text-lg font-semibold text-gray-900 mb-3">체크인 히스토리</h2>
      {goal.checkIns.length === 0 ? (
        <div className="text-center py-8 text-gray-400 text-sm">아직 체크인이 없습니다.</div>
      ) : (
        <div className="space-y-4">
          {goal.checkIns.map((ci) => (
            <div key={ci.id} className="bg-white rounded-lg border border-gray-200 p-4">
              <div className="flex justify-between text-sm mb-1">
                <span className="font-medium text-gray-700">진행률 {ci.progress}%</span>
                <span className="text-gray-400 text-xs">{new Date(ci.createdAt).toLocaleDateString('ko-KR')}</span>
              </div>
              {ci.note && <p className="text-sm text-gray-600 mt-1">{ci.note}</p>}

              {ci.comments.length > 0 && (
                <div className="mt-3 space-y-2">
                  {ci.comments.map((c) => (
                    <div key={c.id} className="bg-indigo-50 rounded p-2 text-sm">
                      <span className="font-medium text-indigo-700">{c.author.name}</span>
                      <span className="text-gray-700 ml-2">{c.content}</span>
                    </div>
                  ))}
                </div>
              )}

              {activeCheckinId === ci.id ? (
                <div className="mt-3 flex gap-2">
                  <input
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="코멘트 입력..."
                    className="flex-1 border border-gray-300 rounded px-3 py-1.5 text-sm outline-none focus:border-indigo-500"
                  />
                  <button onClick={() => submitComment(ci.id)} className="bg-indigo-600 text-white px-3 py-1.5 rounded text-sm hover:bg-indigo-700">
                    등록
                  </button>
                  <button onClick={() => setActiveCheckinId(null)} className="text-gray-400 text-sm px-2">취소</button>
                </div>
              ) : (
                <button onClick={() => setActiveCheckinId(ci.id)} className="mt-2 text-xs text-indigo-600 hover:underline">
                  코멘트 달기
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 3: Commit**

```bash
git add app/\(main\)/goals/
git commit -m "feat: 목표 목록·상세 UI"
```

---

## Task 7: 체크인 UI

**목적:** 담당자가 진행률을 업데이트하는 화면.

**Files:**
- Create: `app/(main)/goals/[id]/checkin/page.tsx`

- [ ] **Step 1: app/(main)/goals/[id]/checkin/page.tsx 생성**

```typescript
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function CheckInPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState<'ON_TRACK' | 'OFF_TRACK'>('ON_TRACK');
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const res = await fetch(`/api/goals/${params.id}/checkins`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ progress, status, note }),
    });
    setLoading(false);
    if (res.ok) router.push(`/goals/${params.id}`);
  }

  return (
    <div className="max-w-lg">
      <button onClick={() => router.back()} className="text-sm text-gray-500 hover:text-gray-700 mb-4">
        ← 목표로 돌아가기
      </button>
      <h1 className="text-xl font-bold text-gray-900 mb-6">체크인 작성</h1>

      <form onSubmit={handleSubmit} className="bg-white rounded-lg border border-gray-200 p-6 space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">진행률 ({progress}%)</label>
          <input
            type="range" min={0} max={100} value={progress}
            onChange={(e) => setProgress(Number(e.target.value))}
            className="w-full accent-indigo-600"
          />
          <div className="flex justify-between text-xs text-gray-400 mt-1">
            <span>0%</span><span>50%</span><span>100%</span>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">현재 상태</label>
          <div className="flex gap-3">
            {(['ON_TRACK', 'OFF_TRACK'] as const).map((s) => (
              <button
                key={s} type="button"
                onClick={() => setStatus(s)}
                className={`flex-1 py-2 rounded-lg text-sm font-medium border transition ${
                  status === s
                    ? s === 'ON_TRACK' ? 'bg-green-600 text-white border-green-600' : 'bg-red-600 text-white border-red-600'
                    : 'bg-white text-gray-600 border-gray-300'
                }`}
              >
                {s === 'ON_TRACK' ? '✅ 순항' : '⚠️ 난항'}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">이번 기간 활동 (선택)</label>
          <textarea
            value={note} onChange={(e) => setNote(e.target.value)}
            placeholder="이번 기간에 한 일을 간략히 적어주세요"
            rows={4}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-indigo-500"
          />
        </div>

        <button
          type="submit" disabled={loading}
          className="w-full rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
        >
          {loading ? '제출 중...' : '체크인 제출'}
        </button>
      </form>
    </div>
  );
}
```

- [ ] **Step 2: 동작 테스트**

개발 서버에서 `/goals/{임의의ID}/checkin` 접속 → 진행률 슬라이더, 상태 버튼, 메모 입력 확인.

- [ ] **Step 3: Commit**

```bash
git add app/\(main\)/goals/\[id\]/checkin/
git commit -m "feat: 체크인 UI"
```

---

## Task 8: 리뷰어 대시보드 UI

**목적:** 리뷰어(부서장/대표)가 담당자별 목표 진행률을 한눈에 보는 화면.

**Files:**
- Modify: `app/(main)/dashboard/page.tsx`
- Create: `app/api/dashboard/route.ts`

- [ ] **Step 1: app/api/dashboard/route.ts 생성**

```typescript
import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: '인증 필요' }, { status: 401 });

  // 내가 리뷰어인 담당자 목록
  const reviewees = await prisma.user.findMany({
    where: { reviewerId: session.user.id },
    select: {
      id: true, name: true, email: true,
      goals: {
        where: { deletedAt: null },
        include: {
          checkIns: {
            orderBy: { createdAt: 'desc' },
            take: 1,
          },
        },
      },
    },
  });

  return NextResponse.json({ data: reviewees });
}
```

- [ ] **Step 2: app/(main)/dashboard/page.tsx 전체 교체**

```typescript
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface RevieweeGoal {
  id: string;
  title: string;
  status: string;
  checkIns: { progress: number }[];
}

interface Reviewee {
  id: string;
  name: string;
  goals: RevieweeGoal[];
}

const STATUS_COLOR: Record<string, string> = {
  PENDING: 'bg-gray-100 text-gray-600',
  ON_TRACK: 'bg-green-100 text-green-700',
  OFF_TRACK: 'bg-red-100 text-red-700',
  COMPLETED: 'bg-blue-100 text-blue-700',
};
const STATUS_LABEL: Record<string, string> = {
  PENDING: '대기', ON_TRACK: '순항', OFF_TRACK: '난항', COMPLETED: '완료',
};

export default function DashboardPage() {
  const router = useRouter();
  const [reviewees, setReviewees] = useState<Reviewee[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/dashboard').then(r => r.json()).then(d => {
      setReviewees(d.data || []);
      setLoading(false);
    });
  }, []);

  if (loading) return <div className="text-center py-12 text-gray-500">로드 중...</div>;

  const offTrackCount = reviewees.flatMap(r => r.goals).filter(g => g.status === 'OFF_TRACK').length;

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-2">리뷰어 대시보드</h1>
      {offTrackCount > 0 && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-sm text-red-700">
          ⚠️ 난항 목표 {offTrackCount}건이 있습니다. 확인이 필요합니다.
        </div>
      )}

      {reviewees.length === 0 ? (
        <div className="text-center py-12 text-gray-400">담당자가 없습니다.</div>
      ) : (
        <div className="space-y-6">
          {reviewees.map((reviewee) => (
            <div key={reviewee.id} className="bg-white rounded-lg border border-gray-200 p-5">
              <h2 className="font-semibold text-gray-900 mb-4">{reviewee.name}</h2>

              {reviewee.goals.length === 0 ? (
                <p className="text-sm text-gray-400">목표 없음</p>
              ) : (
                <div className="space-y-3">
                  {reviewee.goals
                    .sort((a, b) => (a.status === 'OFF_TRACK' ? -1 : 1))
                    .map((goal) => {
                      const progress = goal.checkIns[0]?.progress ?? 0;
                      return (
                        <div
                          key={goal.id}
                          onClick={() => router.push(`/goals/${goal.id}`)}
                          className={`rounded-lg p-3 cursor-pointer transition hover:opacity-80 ${
                            goal.status === 'OFF_TRACK' ? 'bg-red-50 border border-red-200' : 'bg-gray-50'
                          }`}
                        >
                          <div className="flex justify-between items-center mb-1">
                            <span className="text-sm font-medium text-gray-800">{goal.title}</span>
                            <span className={`text-xs px-2 py-0.5 rounded-full ${STATUS_COLOR[goal.status]}`}>
                              {STATUS_LABEL[goal.status]}
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-1.5">
                            <div
                              className={`h-1.5 rounded-full ${goal.status === 'OFF_TRACK' ? 'bg-red-500' : 'bg-indigo-500'}`}
                              style={{ width: `${progress}%` }}
                            />
                          </div>
                          <div className="text-right text-xs text-gray-400 mt-1">{progress}%</div>
                        </div>
                      );
                    })}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 3: Commit**

```bash
git add app/\(main\)/dashboard/page.tsx app/api/dashboard/
git commit -m "feat: 리뷰어 대시보드"
```

---

## Task 9: 관리자 UI

**목적:** 멤버 관리, CSV 업로드, 사이클 관리 화면.

**Files:**
- Create: `app/(main)/admin/page.tsx`
- Create: `app/(main)/admin/members/page.tsx`
- Create: `app/(main)/admin/org-upload/page.tsx`
- Create: `app/(main)/admin/cycles/page.tsx`

- [ ] **Step 1: app/(main)/admin/page.tsx 생성**

```typescript
'use client';

import { useRouter } from 'next/navigation';

const MENU = [
  { href: '/admin/members', label: '👥 멤버 관리', desc: '역할 설정, 리뷰어 지정' },
  { href: '/admin/org-upload', label: '📂 조직도 업로드', desc: 'Flex HR CSV 파일 업로드' },
  { href: '/admin/cycles', label: '🔄 사이클 관리', desc: '분기 목표 주기 생성·관리' },
];

export default function AdminPage() {
  const router = useRouter();
  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">관리자 설정</h1>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {MENU.map((m) => (
          <button
            key={m.href}
            onClick={() => router.push(m.href)}
            className="text-left bg-white rounded-lg border border-gray-200 p-5 hover:shadow-md transition"
          >
            <div className="text-lg font-semibold text-gray-900 mb-1">{m.label}</div>
            <div className="text-sm text-gray-500">{m.desc}</div>
          </button>
        ))}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: app/(main)/admin/members/page.tsx 생성**

```typescript
'use client';

import { useEffect, useState } from 'react';

interface Member {
  id: string; name: string; email: string; role: string;
  reviewer?: { name: string };
}

const ROLES = ['ADMIN', 'REVIEWER', 'MEMBER'];

export default function MembersPage() {
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/admin/members').then(r => r.json()).then(d => {
      setMembers(d.data || []);
      setLoading(false);
    });
  }, []);

  async function updateRole(userId: string, role: string) {
    await fetch('/api/admin/members', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, role }),
    });
    setMembers(prev => prev.map(m => m.id === userId ? { ...m, role } : m));
  }

  if (loading) return <div className="text-center py-12 text-gray-500">로드 중...</div>;

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">멤버 관리</h1>
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="text-left px-4 py-3 text-gray-600 font-medium">이름</th>
              <th className="text-left px-4 py-3 text-gray-600 font-medium">이메일</th>
              <th className="text-left px-4 py-3 text-gray-600 font-medium">리뷰어</th>
              <th className="text-left px-4 py-3 text-gray-600 font-medium">역할</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {members.map((m) => (
              <tr key={m.id}>
                <td className="px-4 py-3 font-medium text-gray-900">{m.name}</td>
                <td className="px-4 py-3 text-gray-500">{m.email}</td>
                <td className="px-4 py-3 text-gray-500">{m.reviewer?.name ?? '—'}</td>
                <td className="px-4 py-3">
                  <select
                    value={m.role}
                    onChange={(e) => updateRole(m.id, e.target.value)}
                    className="border border-gray-300 rounded px-2 py-1 text-sm outline-none focus:border-indigo-500"
                  >
                    {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
```

- [ ] **Step 3: app/(main)/admin/org-upload/page.tsx 생성**

```typescript
'use client';

import { useState } from 'react';

export default function OrgUploadPage() {
  const [file, setFile] = useState<File | null>(null);
  const [result, setResult] = useState<{ created: number; updated: number; total: number } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleUpload() {
    if (!file) return;
    setLoading(true); setError('');
    const formData = new FormData();
    formData.append('file', file);
    const res = await fetch('/api/admin/org-upload', { method: 'POST', body: formData });
    setLoading(false);
    if (res.ok) {
      const data = await res.json();
      setResult(data.data);
    } else {
      setError('업로드 실패. CSV 형식을 확인하세요.');
    }
  }

  return (
    <div className="max-w-lg">
      <h1 className="text-2xl font-bold text-gray-900 mb-2">조직도 업로드</h1>
      <p className="text-sm text-gray-500 mb-6">
        Flex HR에서 내보낸 CSV 파일을 업로드하세요.<br />
        필요 컬럼: <code className="bg-gray-100 px-1 rounded">이름, 이메일, 부서, 직책, 리뷰어이메일</code>
      </p>

      <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-4">
        <input
          type="file" accept=".csv"
          onChange={(e) => setFile(e.target.files?.[0] || null)}
          className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
        />
        <button
          onClick={handleUpload} disabled={!file || loading}
          className="w-full rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
        >
          {loading ? '업로드 중...' : '업로드'}
        </button>

        {error && <div className="text-sm text-red-600">{error}</div>}
        {result && (
          <div className="bg-green-50 rounded-lg p-4 text-sm text-green-700">
            ✅ 완료: 전체 {result.total}명 (신규 {result.created}명, 업데이트 {result.updated}명)
          </div>
        )}
      </div>
    </div>
  );
}
```

- [ ] **Step 4: app/(main)/admin/cycles/page.tsx 생성**

```typescript
'use client';

import { useEffect, useState } from 'react';

interface Cycle { id: string; name: string; startDate: string; endDate: string; }

export default function CyclesPage() {
  const [cycles, setCycles] = useState<Cycle[]>([]);
  const [name, setName] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch('/api/admin/cycles').then(r => r.json()).then(d => setCycles(d.data || []));
  }, []);

  async function createCycle() {
    if (!name || !startDate || !endDate) return;
    setLoading(true);
    const res = await fetch('/api/admin/cycles', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, startDate, endDate }),
    });
    if (res.ok) {
      const data = await res.json();
      setCycles(prev => [data.data, ...prev]);
      setName(''); setStartDate(''); setEndDate('');
    }
    setLoading(false);
  }

  return (
    <div className="max-w-lg">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">사이클 관리</h1>

      <div className="bg-white rounded-lg border border-gray-200 p-5 mb-6 space-y-3">
        <h2 className="font-semibold text-gray-700">새 사이클 만들기</h2>
        <input value={name} onChange={e => setName(e.target.value)}
          placeholder="예: 2026년 2분기" className="w-full border border-gray-300 rounded px-3 py-2 text-sm outline-none focus:border-indigo-500" />
        <div className="flex gap-2">
          <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)}
            className="flex-1 border border-gray-300 rounded px-3 py-2 text-sm outline-none focus:border-indigo-500" />
          <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)}
            className="flex-1 border border-gray-300 rounded px-3 py-2 text-sm outline-none focus:border-indigo-500" />
        </div>
        <button onClick={createCycle} disabled={loading}
          className="w-full rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50">
          {loading ? '생성 중...' : '사이클 생성'}
        </button>
      </div>

      <div className="space-y-2">
        {cycles.map(c => (
          <div key={c.id} className="bg-white rounded-lg border border-gray-200 px-4 py-3 text-sm flex justify-between">
            <span className="font-medium text-gray-900">{c.name}</span>
            <span className="text-gray-400">
              {new Date(c.startDate).toLocaleDateString('ko-KR')} ~ {new Date(c.endDate).toLocaleDateString('ko-KR')}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
```

- [ ] **Step 5: 사이드바 네비게이션 업데이트**

`app/(main)/layout.tsx`의 nav 링크에 `/admin` 추가 (ADMIN 역할만):

기존 코드에서 admin 링크 부분:
```typescript
{user?.role === 'ADMIN' && (
  <a href="/admin" className="block rounded px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100">
    ⚙️ 관리자
  </a>
)}
```

- [ ] **Step 6: Commit**

```bash
git add app/\(main\)/admin/ app/\(main\)/layout.tsx
git commit -m "feat: 관리자 UI (멤버·조직도·사이클)"
```

---

## Task 10: 목표 등록 화면 + 사이클 연동

**목적:** 새 목표를 등록할 때 사이클을 선택하는 화면.

**Files:**
- Create: `app/(main)/goals/new/page.tsx`

- [ ] **Step 1: app/(main)/goals/new/page.tsx 생성**

```typescript
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface Cycle { id: string; name: string; }

export default function NewGoalPage() {
  const router = useRouter();
  const [cycles, setCycles] = useState<Cycle[]>([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [cycleId, setCycleId] = useState('');
  const [level, setLevel] = useState<'COMPANY' | 'TEAM' | 'INDIVIDUAL'>('INDIVIDUAL');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch('/api/admin/cycles').then(r => r.json()).then(d => {
      const data = d.data || [];
      setCycles(data);
      if (data.length > 0) setCycleId(data[0].id);
    });
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || !cycleId) return;
    setLoading(true);
    const res = await fetch('/api/goals', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, description, cycleId, level }),
    });
    setLoading(false);
    if (res.ok) router.push('/goals');
  }

  return (
    <div className="max-w-lg">
      <button onClick={() => router.back()} className="text-sm text-gray-500 hover:text-gray-700 mb-4">
        ← 목록으로
      </button>
      <h1 className="text-xl font-bold text-gray-900 mb-6">새 목표 등록</h1>

      <form onSubmit={handleSubmit} className="bg-white rounded-lg border border-gray-200 p-6 space-y-5">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">목표명 *</label>
          <input value={title} onChange={e => setTitle(e.target.value)}
            placeholder="달성하고자 하는 목표를 입력하세요"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-indigo-500" required />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">설명 (선택)</label>
          <textarea value={description} onChange={e => setDescription(e.target.value)}
            rows={3} placeholder="목표에 대한 추가 설명"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-indigo-500" />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">사이클 *</label>
          <select value={cycleId} onChange={e => setCycleId(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-indigo-500" required>
            {cycles.length === 0 && <option value="">사이클 없음 (관리자에게 요청)</option>}
            {cycles.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">목표 레벨</label>
          <div className="flex gap-2">
            {(['COMPANY', 'TEAM', 'INDIVIDUAL'] as const).map(l => (
              <button key={l} type="button" onClick={() => setLevel(l)}
                className={`flex-1 py-2 rounded-lg text-sm font-medium border transition ${
                  level === l ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-gray-600 border-gray-300'
                }`}>
                {l === 'COMPANY' ? '전사' : l === 'TEAM' ? '팀' : '개인'}
              </button>
            ))}
          </div>
        </div>

        <button type="submit" disabled={loading}
          className="w-full rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50">
          {loading ? '등록 중...' : '목표 등록'}
        </button>
      </form>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add app/\(main\)/goals/new/
git commit -m "feat: 목표 등록 화면"
```

---

## Task 11: 전체 통합 테스트 (UAT)

**목적:** 핵심 플로우 전체를 실제로 사용해보며 검증. 황유리 선임 담당.

- [ ] **UAT 시나리오 1: 관리자 플로우**
  1. Jay 계정으로 로그인
  2. `/admin/cycles` → "2026년 2분기" 사이클 생성
  3. `/admin/org-upload` → Flex CSV 업로드 (테스트용 CSV 사용)
  4. `/admin/members` → 멤버 목록 확인, 역할 변경

- [ ] **UAT 시나리오 2: 담당자 플로우**
  1. MEMBER 계정으로 로그인
  2. `/goals` → "새 목표" 클릭
  3. 목표 등록 (제목·사이클 선택)
  4. 목표 상세 → 체크인 작성 → 제출
  5. 리뷰어 Slack 알림 수신 확인

- [ ] **UAT 시나리오 3: 리뷰어 플로우**
  1. REVIEWER 계정으로 로그인
  2. `/dashboard` → 담당자 목표 목록 확인
  3. 목표 클릭 → 체크인 내역 확인
  4. 코멘트 작성 → 담당자 Slack 알림 수신 확인

- [ ] **UAT 결과 기록**

이슈 발생 시 GitHub Issues에 등록.

---

## 개발실 전달 사항

배포 시 아래를 개발실에 요청:

```bash
# 서버에서 실행
git clone https://github.com/hyr10-cell/okr-tool.git
cd okr-tool
npm install
# .env 파일 생성 후 DATABASE_URL 등 입력
npx prisma migrate deploy
npm run db:seed
npm run build
npm start
# 포트 3000으로 사내 망에 공개
```
