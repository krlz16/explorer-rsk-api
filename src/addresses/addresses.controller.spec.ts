import { Test, TestingModule } from '@nestjs/testing';
import { AddressesController } from './addresses.controller';
import { AddressesService } from './addresses.service';

describe('AddressesController', () => {
  let controller: AddressesController;
  let addressServiceMock: Partial<AddressesService>;

  beforeEach(async () => {
    addressServiceMock = {
      getAddresses: jest.fn().mockResolvedValue({
        pagination: { nextCursor: null, prevCursor: null, take: 10 },
        data: [{ id: 1, address: '0x123' }],
      }),
      getAddress: jest.fn().mockResolvedValue({
        id: 1,
        address: '0x123',
        balance: '0.5',
      }),
      getContractVerification: jest.fn().mockResolvedValue({ verified: true }),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AddressesController],
      providers: [{ provide: AddressesService, useValue: addressServiceMock }],
    }).compile();

    controller = module.get<AddressesController>(AddressesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should return a paginated list of addresses', async () => {
    const result = await controller.getAllAddresses(10, undefined);

    expect(result).toEqual({
      pagination: { nextCursor: null, prevCursor: null, take: 10 },
      data: [{ id: 1, address: '0x123' }],
    });

    expect(addressServiceMock.getAddresses).toHaveBeenCalledWith(10, undefined);
  });

  it('should return address details', async () => {
    const result = await controller.getAddress('0x123');

    expect(result).toEqual({
      id: 1,
      address: '0x123',
      balance: '0.5',
    });

    expect(addressServiceMock.getAddress).toHaveBeenCalledWith('0x123');
  });

  it('should return contract verification status', async () => {
    const result = await controller.getContractVerification('0x123');

    expect(result).toEqual({ verified: true });

    expect(addressServiceMock.getContractVerification).toHaveBeenCalledWith(
      '0x123',
    );
  });
});
