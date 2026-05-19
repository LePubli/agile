import { Injectable } from '@nestjs/common';

@Injectable()
export class TenantsService {
  async findAll() {
    return [];
  }

  async findOne(id: string) {
    return { id, name: 'Demo Tenant' };
  }

  async create(data: any) {
    return data;
  }
}
