import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // 부서 생성
  const deptEng = await prisma.department.create({
    data: { name: '개발팀' },
  });

  const deptMkt = await prisma.department.create({
    data: { name: '마케팅팀' },
  });

  // 사용자 생성 (Credentials 제공자용 - 실제로는 bcrypt로 해시된 비밀번호 필요)
  const user1 = await prisma.user.create({
    data: {
      email: 'admin@example.com',
      name: '관리자',
      role: 'ADMIN',
      departments: {
        create: { departmentId: deptEng.id, isManager: true },
      },
    },
  });

  const user2 = await prisma.user.create({
    data: {
      email: 'manager@example.com',
      name: '팀장',
      role: 'MANAGER',
      departments: {
        create: { departmentId: deptEng.id, isManager: true },
      },
    },
  });

  const user3 = await prisma.user.create({
    data: {
      email: 'member@example.com',
      name: '팀원',
      role: 'MEMBER',
      departments: {
        create: { departmentId: deptEng.id },
      },
    },
  });

  // 사이클 생성
  const cycle = await prisma.goalCycle.create({
    data: {
      name: '2024년 Q2',
      startDate: new Date('2024-04-01'),
      endDate: new Date('2024-06-30'),
      restrictPeriod: false,
      allowApproval: true,
    },
  });

  // 목표 생성
  await prisma.goal.create({
    data: {
      cycleId: cycle.id,
      title: '서비스 성능 개선',
      level: 'COMPANY',
      ownerDeptId: deptEng.id,
      ownerUserId: user2.id,
      createdById: user1.id,
      startDate: cycle.startDate!,
      endDate: cycle.endDate!,
      description: '웹 응답 속도 50% 개선',
      status: 'ON_TRACK',
      hasMetric: true,
      metricName: '평균 응답 시간 (ms)',
      metricStart: 500,
      metricTarget: 250,
    },
  });

  console.log('✓ Seed 데이터 생성 완료');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
