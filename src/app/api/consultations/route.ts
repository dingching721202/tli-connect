import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { 
  Consultation,
  ConsultationType, 
  ConsultationStatus,
  ConsultationApiResponse,
  ConsultationStats,
  CreateConsultationRequest,
  UpdateConsultationRequest
} from '@/types/consultation';

// 數據文件路徑
const DATA_FILE = path.join(process.cwd(), 'data', 'consultations.json');

// 讀取諮詢數據
function loadConsultations(): Consultation[] {
  try {
    if (fs.existsSync(DATA_FILE)) {
      const data = fs.readFileSync(DATA_FILE, 'utf8');
      return JSON.parse(data);
    }
  } catch (error) {
    console.error('讀取諮詢數據失敗:', error);
  }
  return getDefaultConsultations();
}

// 保存諮詢數據
function saveConsultations(consultations: Consultation[]): void {
  try {
    const dataDir = path.dirname(DATA_FILE);
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    fs.writeFileSync(DATA_FILE, JSON.stringify(consultations, null, 2));
  } catch (error) {
    console.error('保存諮詢數據失敗:', error);
  }
}

// 預設諮詢數據
function getDefaultConsultations(): Consultation[] {
  return [
  // 個人諮詢範例
  {
    id: 'cons_ind_1',
    type: ConsultationType.INDIVIDUAL,
    status: ConsultationStatus.LEAD,
    contactName: '李小華',
    email: 'li@example.com',
    phone: '+886 912 345 678',
    submittedAt: '2025-07-28T14:20:00Z',
    updatedAt: '2025-07-28T14:20:00Z',
    source: 'homepage',
    notes: '從首頁表單提交'
  },
  {
    id: 'cons_ind_2',
    type: ConsultationType.INDIVIDUAL,
    status: ConsultationStatus.LEAD,
    contactName: '王小明',
    email: 'wang@example.com',
    phone: '+886 987 654 321',
    submittedAt: '2025-07-25T10:15:00Z',
    updatedAt: '2025-07-25T10:15:00Z',
    source: 'membership',
    notes: '從會員管理提交'
  },
  // 企業諮詢範例
  {
    id: 'cons_corp_1',
    type: ConsultationType.CORPORATE,
    status: ConsultationStatus.LEAD,
    contactName: '張小明',
    email: 'zhang@example.com',
    phone: '+886 2 1234 5678',
    companyName: 'ABC科技股份有限公司',
    contactTitle: '人資經理',
    trainingNeeds: ['中文', '英文'],
    trainingSize: '50–100',
    message: '我們希望為員工提供語言培訓課程',
    submittedAt: '2025-07-30T10:30:00Z',
    updatedAt: '2025-07-30T10:30:00Z',
    source: 'corporate_form'
  },
  {
    id: 'cons_corp_2',
    type: ConsultationType.CORPORATE,
    status: ConsultationStatus.LEAD,
    contactName: '陳小美',
    email: 'chen@corp.com',
    phone: '+886 2 9876 5432',
    companyName: 'XYZ製造有限公司',
    contactTitle: '訓練主管',
    trainingNeeds: ['商業', '師培'],
    trainingSize: '100–300',
    message: '需要針對主管階層的培訓課程',
    submittedAt: '2025-07-20T09:15:00Z',
    updatedAt: '2025-07-20T09:15:00Z',
    source: 'corporate_form'
  },
  {
    id: 'cons_corp_3',
    type: ConsultationType.CORPORATE,
    status: ConsultationStatus.LEAD,
    contactName: '林大華',
    email: 'lin@bigcorp.com',
    phone: '+886 2 5555 6666',
    companyName: '大企業集團',
    contactTitle: '副總經理',
    trainingNeeds: ['中文', '文化', '商業'],
    trainingSize: '300–500',
    message: '需要針對海外員工的中文培訓',
    submittedAt: '2025-07-15T08:00:00Z',
    updatedAt: '2025-07-15T08:00:00Z',
    source: 'corporate_form'
  }
];

// GET - 取得諮詢列表
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type'); // 'all', 'individual', 'corporate'
    const status = searchParams.get('status');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search');
    const source = searchParams.get('source');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    const consultations = loadConsultations();
    let filtered = [...consultations];

    // 類型篩選
    if (type && type !== 'all') {
      filtered = filtered.filter(consultation => 
        consultation.type === type
      );
    }

    // 狀態篩選
    if (status && status !== 'all') {
      filtered = filtered.filter(consultation => 
        consultation.status === status
      );
    }

    // 來源篩選
    if (source && source !== 'all') {
      filtered = filtered.filter(consultation => 
        consultation.source === source
      );
    }

    // 搜索篩選
    if (search) {
      const searchLower = search.toLowerCase();
      filtered = filtered.filter(consultation => {
        const basicMatch = 
          consultation.contactName.toLowerCase().includes(searchLower) ||
          consultation.email.toLowerCase().includes(searchLower);
        
        // 企業諮詢額外搜索企業名稱
        if (consultation.type === ConsultationType.CORPORATE && consultation.companyName) {
          return basicMatch || 
            consultation.companyName.toLowerCase().includes(searchLower);
        }
        
        return basicMatch;
      });
    }

    // 日期範圍篩選
    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      filtered = filtered.filter(consultation => {
        const submittedDate = new Date(consultation.submittedAt);
        return submittedDate >= start && submittedDate <= end;
      });
    }

    // 按提交時間排序（最新的在前）
    filtered.sort((a, b) => 
      new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime()
    );

    // 分頁
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedData = filtered.slice(startIndex, endIndex);

    const response: ConsultationApiResponse = {
      success: true,
      data: paginatedData,
      total: filtered.length,
      page,
      limit
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('取得諮詢數據失敗:', error);
    return NextResponse.json(
      { success: false, message: '取得諮詢數據失敗' },
      { status: 500 }
    );
  }
}

// POST - 創建新的諮詢或取得統計數據
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action } = body;

    // 統計數據請求
    if (action === 'stats') {
      const consultations = loadConsultations();
      const stats: ConsultationStats = {
        total: consultations.length,
        individual: consultations.filter(c => c.type === ConsultationType.INDIVIDUAL).length,
        corporate: consultations.filter(c => c.type === ConsultationType.CORPORATE).length,
        byStatus: {
          [ConsultationStatus.LEAD]: consultations.filter(c => c.status === ConsultationStatus.LEAD).length,
          [ConsultationStatus.CONTACTED]: consultations.filter(c => c.status === ConsultationStatus.CONTACTED).length,
          [ConsultationStatus.QUALIFICATION]: consultations.filter(c => c.status === ConsultationStatus.QUALIFICATION).length,
          [ConsultationStatus.PROPOSAL]: consultations.filter(c => c.status === ConsultationStatus.PROPOSAL).length,
          [ConsultationStatus.NEGOTIATION]: consultations.filter(c => c.status === ConsultationStatus.NEGOTIATION).length,
          [ConsultationStatus.CLOSED_WON]: consultations.filter(c => c.status === ConsultationStatus.CLOSED_WON).length,
          [ConsultationStatus.CLOSED_LOST]: consultations.filter(c => c.status === ConsultationStatus.CLOSED_LOST).length
        },
        bySource: {
          homepage: consultations.filter(c => c.source === 'homepage').length,
          membership: consultations.filter(c => c.source === 'membership').length,
          corporate_form: consultations.filter(c => c.source === 'corporate_form').length
        }
      };

      return NextResponse.json({
        success: true,
        data: [stats]
      });
    }

    // 創建新的諮詢
    const createRequest = body as CreateConsultationRequest;
    const { type, contactName, email, phone, source, companyName, contactTitle, trainingNeeds, trainingSize, message } = createRequest;

    // 驗證必填欄位
    if (!type || !contactName || !email) {
      return NextResponse.json(
        { success: false, message: '類型、姓名和電子郵件為必填欄位' },
        { status: 400 }
      );
    }

    // 企業諮詢需要企業名稱
    if (type === ConsultationType.CORPORATE && !companyName) {
      return NextResponse.json(
        { success: false, message: '企業諮詢需要提供企業名稱' },
        { status: 400 }
      );
    }

    // 創建新的諮詢記錄
    const newConsultation: Consultation = {
      id: `cons_${type}_${Date.now()}`,
      type,
      status: ConsultationStatus.LEAD,
      contactName,
      email,
      phone,
      submittedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      source,
      message, // 個人和企業諮詢都可以有 message
      
      // 企業專用欄位
      ...(type === ConsultationType.CORPORATE && {
        companyName,
        contactTitle,
        trainingNeeds: trainingNeeds || [],
        trainingSize
      })
    };

    const consultations = loadConsultations();
    consultations.push(newConsultation);
    saveConsultations(consultations);

    const response: ConsultationApiResponse = {
      success: true,
      data: [newConsultation],
      message: `${type === ConsultationType.INDIVIDUAL ? '個人' : '企業'}諮詢創建成功`
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('處理POST請求失敗:', error);
    return NextResponse.json(
      { success: false, message: '處理請求失敗' },
      { status: 500 }
    );
  }
}

// PUT - 更新諮詢
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json() as UpdateConsultationRequest;
    const { id, status, notes, ...updateData } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, message: '諮詢ID為必填' },
        { status: 400 }
      );
    }

    const consultations = loadConsultations();
    const consultationIndex = consultations.findIndex(
      consultation => consultation.id === id
    );

    if (consultationIndex === -1) {
      return NextResponse.json(
        { success: false, message: '找不到指定的諮詢記錄' },
        { status: 404 }
      );
    }

    const currentConsultation = consultations[consultationIndex];

    // 更新狀態
    if (status && status !== currentConsultation.status) {
      currentConsultation.status = status;
      
      // 添加狀態歷史記錄
      if (!currentConsultation.statusHistory) {
        currentConsultation.statusHistory = [];
      }
      currentConsultation.statusHistory.push({
        status,
        timestamp: new Date().toISOString(),
        notes: notes || undefined
      });
    }

    // 更新備註
    if (notes !== undefined) {
      currentConsultation.notes = notes;
    }

    // 更新其他欄位
    Object.keys(updateData).forEach(key => {
      if (updateData[key as keyof typeof updateData] !== undefined) {
        (currentConsultation as any)[key] = updateData[key as keyof typeof updateData];
      }
    });

    currentConsultation.updatedAt = new Date().toISOString();
    saveConsultations(consultations);

    const response: ConsultationApiResponse = {
      success: true,
      data: [currentConsultation],
      message: '諮詢記錄更新成功'
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('更新諮詢失敗:', error);
    return NextResponse.json(
      { success: false, message: '更新諮詢失敗' },
      { status: 500 }
    );
  }
}

// DELETE - 刪除諮詢
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { success: false, message: '諮詢ID為必填' },
        { status: 400 }
      );
    }

    const consultations = loadConsultations();
    const consultationIndex = consultations.findIndex(
      consultation => consultation.id === id
    );

    if (consultationIndex === -1) {
      return NextResponse.json(
        { success: false, message: '找不到指定的諮詢記錄' },
        { status: 404 }
      );
    }

    // 刪除諮詢記錄
    const deletedConsultation = consultations.splice(consultationIndex, 1)[0];
    saveConsultations(consultations);

    const response = {
      success: true,
      message: `${deletedConsultation.type === ConsultationType.INDIVIDUAL ? '個人' : '企業'}諮詢記錄刪除成功`
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('刪除諮詢記錄失敗:', error);
    return NextResponse.json(
      { success: false, message: '刪除諮詢記錄失敗' },
      { status: 500 }
    );
  }
}