import { Test, TestingModule } from '@nestjs/testing';
import { AddressesService } from './addresses.service';
import { PrismaService } from 'src/prisma.service';
import { AddressParserService } from 'src/common/parsers/address-parser.service';
import { PaginationService } from 'src/common/pagination/pagination.service'; //

describe('AddressesService', () => {
  let service: AddressesService;
  let prisma: PrismaService;
  let addressParser: AddressParserService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AddressesService,
        PaginationService,
        {
          provide: PrismaService,
          useValue: {
            address: {
              count: jest.fn().mockResolvedValue(10), // Mocking count
              findMany: jest.fn(), // We will mock this dynamically in each test
            },
          },
        },
        {
          provide: AddressParserService,
          useValue: {
            formatAddresses: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<AddressesService>(AddressesService);
    prisma = module.get<PrismaService>(PrismaService);
    addressParser = module.get<AddressParserService>(AddressParserService);
  });

  describe('getAddresses', () => {
    it('should return paginated addresses (first page)', async () => {
      const mockAddresses = [
        {
          id: 10,
          address: '0x123',
          isNative: false,
          type: 'account',
          name: 'Test Account',
        },
        {
          id: 9,
          address: '0x456',
          isNative: true,
          type: 'contract',
          name: 'Test Contract',
        },
      ];
      const formattedAddresses = [{ address: '0x123' }, { address: '0x456' }];

      jest.spyOn(prisma.address, 'findMany').mockResolvedValue(mockAddresses);
      jest
        .spyOn(addressParser, 'formatAddresses')
        .mockReturnValue(formattedAddresses);

      const result = await service.getAddresses(2, null);

      expect(result).toEqual({
        pagination: {
          skip: 0,
          take: 50,
          totalPages: 1,
          total: 10,
          currentPage: 2,
        },
        data: formattedAddresses, // Ensure this matches expected formatted output
      });

      expect(prisma.address.findMany).toHaveBeenCalledWith({
        take: 50,
        skip: 0,
        include: expect.any(Object),
        orderBy: { id: 'desc' },
      });

      expect(addressParser.formatAddresses).toHaveBeenCalledWith(mockAddresses);
    });

    it('should return paginated addresses (next page)', async () => {
      const mockAddresses = [
        {
          id: 8,
          address: '0x789',
          isNative: false,
          type: 'account',
          name: 'Another Account',
        },
      ];
      jest.spyOn(prisma.address, 'findMany').mockResolvedValue(mockAddresses);
      jest
        .spyOn(addressParser, 'formatAddresses')
        .mockReturnValue(mockAddresses);

      const result = await service.getAddresses(1, 9);

      expect(result).toEqual({
        pagination: {
          skip: 0,
          take: 9,
          totalPages: 2,
          total: 10,
          currentPage: 1,
        },
        data: mockAddresses,
      });

      expect(prisma.address.findMany).toHaveBeenCalledWith({
        take: 9,
        skip: 0,
        include: expect.any(Object),
        orderBy: { id: 'desc' },
      });
    });

    it('should return empty response when no addresses are found', async () => {
      jest.spyOn(prisma.address, 'findMany').mockResolvedValue([]);
      jest.spyOn(addressParser, 'formatAddresses').mockReturnValue([]);

      const result = await service.getAddresses(2, 5);

      expect(result).toEqual({
        pagination: {
          currentPage: 2,
          skip: 5,
          take: 5,
          total: 10,
          totalPages: 2,
        },
        data: [],
      });

      expect(prisma.address.findMany).toHaveBeenCalled();
    });
  });
});
