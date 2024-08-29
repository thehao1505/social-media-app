import { Controller, Get } from '@nestjs/common';

@Controller()
export class AppController {
  constructor() {}

  @Get()
  getHello() {
    return {
      title: 'Dominate the world version',
      status: 'alive',
    };
  }
}
