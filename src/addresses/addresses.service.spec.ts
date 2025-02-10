import { Test, TestingModule } from '@nestjs/testing';
import { AddressesService } from './addresses.service';
import { PrismaService } from 'src/prisma.service';
import { AddressParserService } from 'src/common/parsers/address-parser.service';
import { BadRequestException, NotFoundException } from '@nestjs/common';

describe('AddressesService', () => {
  let service: AddressesService;
  let prisma: PrismaService;
  let addressParser: AddressParserService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AddressesService,
        {
          provide: PrismaService,
          useValue: {
            address: {
              findMany: jest.fn(),
              findFirst: jest.fn(),
            },
            verification_result: {
              findFirst: jest.fn(),
            },
          },
        },
        {
          provide: AddressParserService,
          useValue: {
            formatAddresses: jest.fn(),
            formatAddress: jest.fn(),
            formatContractVerification: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<AddressesService>(AddressesService);
    prisma = module.get<PrismaService>(PrismaService);
    addressParser = module.get<AddressParserService>(AddressParserService);
  });

  describe('getAddresses', () => {
    it('should return paginated addresses using keyset pagination', async () => {
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
      const formattedAddresses = [
        { id: 10, address: '0x123' },
        { id: 9, address: '0x456' },
      ];

      jest.spyOn(prisma.address, 'findMany').mockResolvedValue(mockAddresses);
      jest
        .spyOn(addressParser, 'formatAddresses')
        .mockReturnValue(formattedAddresses);

      const result = await service.getAddresses(10, 2);

      expect(result).toEqual({
        pagination: {
          nextCursor: null,
          prevCursor: 2,
          hasMoreData: false,
          take: 10,
        },
        data: formattedAddresses,
      });

      expect(prisma.address.findMany).toHaveBeenCalledWith({
        take: 11,
        skip: 1,
        cursor: { id: 2 },
        include: expect.any(Object),
        orderBy: { id: 'desc' },
      });
    });

    it('should return an empty response when no addresses are found', async () => {
      jest.spyOn(prisma.address, 'findMany').mockResolvedValue([]);
      jest.spyOn(addressParser, 'formatAddresses').mockReturnValue([]);

      const result = await service.getAddresses(5, undefined);

      expect(result).toEqual({
        pagination: {
          nextCursor: null,
          prevCursor: null,
          take: 5,
        },
        data: [],
      });
    });

    it('should throw BadRequestException when trying to paginate backward without a cursor', async () => {
      await expect(service.getAddresses(-5, undefined)).rejects.toThrow(
        'Cannot paginate backward without a cursor.',
      );
    });

    it('should return paginated addresses when paginating backward with a cursor', async () => {
      const mockAddresses = [
        {
          id: 8,
          address: '0x789',
          isNative: false,
          type: 'account',
          name: 'Backward Account',
        },
      ];
      const formattedAddresses = [{ id: 8, address: '0x789' }];

      jest.spyOn(prisma.address, 'findMany').mockResolvedValue(mockAddresses);
      jest
        .spyOn(addressParser, 'formatAddresses')
        .mockReturnValue(formattedAddresses);

      const result = await service.getAddresses(-5, 10);

      expect(result).toEqual({
        pagination: {
          nextCursor: null,
          prevCursor: 10,
          hasMoreData: false,
          take: -5,
        },
        data: formattedAddresses,
      });

      expect(prisma.address.findMany).toHaveBeenCalledWith({
        take: -6, // take - 1 for pagination
        cursor: { id: 10 },
        skip: 1,
        include: expect.any(Object),
        orderBy: { id: 'desc' },
      });
    });
  });

  describe('getAddress', () => {
    it('should return formatted address details', async () => {
      const mockAddressData = {
        id: 9,
        address: '0x1616c21f88ec96d9d650283f5d3bde8d53cbd409',
        type: 'account',
        balance: '0.00005',
        isNative: true,
        name: null,
      };
      const formattedAddress = {
        address: '0x1616c21f88ec96d9d650283f5d3bde8d53cbd409',
        balance: 0.00005,
      };

      jest
        .spyOn(prisma.address, 'findFirst')
        .mockResolvedValue(mockAddressData);
      jest
        .spyOn(addressParser, 'formatAddress')
        .mockReturnValue(formattedAddress);

      const result = await service.getAddress(
        '0x1616c21f88ec96d9d650283f5d3bde8d53cbd409',
      );

      expect(result).toEqual({
        data: formattedAddress,
      });

      expect(prisma.address.findFirst).toHaveBeenCalledWith({
        where: { address: '0x1616c21f88ec96d9d650283f5d3bde8d53cbd409' },
        include: expect.any(Object),
      });
    });

    it('should throw BadRequestException for invalid address format', async () => {
      await expect(service.getAddress('invalid-address')).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should return null if address is not found', async () => {
      jest.spyOn(prisma.address, 'findFirst').mockResolvedValue(null);

      const result = await service.getAddress(
        '0x1616c21f88ec96d9d650283f5d3bde8d53cbd409',
      );

      expect(result).toEqual({ address: null });
    });
  });

  describe('getContractVerification', () => {
    it('should return contract verification details', async () => {
      const mockVerification = {
        id: '5db68e277ea7c3658c3259f9',
        match: true,
        request: JSON.stringify({
          compiler: {
            version: '0.5.8+commit.23d335f2',
          },
          language: 'Solidity',
          evmVersion: 'petersburg',
          optimizer: {
            enabled: false,
            runs: 200,
          },
          remappings: [],
          libraries: {},
        }),
        result: JSON.stringify({
          name: 'Test721',
          bytecode: '0x60806040523480156200001157600080fd',
          resultBytecode: '0x6080604052348015620000115760',
          bytecodeHash:
            '0xb9deceb4bc697123873fd29a906f6ee705b3d94d5c2eb22a34d2d2fdf4632c39',
          resultBytecodeHash:
            '0xb9deceb4bc697123873fd29a906f6ee705b3d94d5c2eb22a34d2d2fdf4632c39',
          opcodes: 'PUSH1 0x80 PUSH1 0x40',
          methodIdentifiers: {
            'name()': '06fdde03',
            'symbol()': '95d89b41',
            'totalSupply()': '18160ddd',
          },
          decodedMetadata: [
            {
              bzzr0:
                '7b86d41905245d0cddab03c40602fcba860db843231d0189039c19578fc091c3',
            },
          ],
        }),
        abi: JSON.stringify([
          {
            constant: true,
            inputs: [],
            name: 'name',
            outputs: [{ name: '', type: 'string' }],
            payable: false,
            stateMutability: 'view',
            type: 'function',
          },
          {
            constant: true,
            inputs: [],
            name: 'symbol',
            outputs: [{ name: '', type: 'string' }],
            payable: false,
            stateMutability: 'view',
            type: 'function',
          },
          {
            constant: true,
            inputs: [],
            name: 'totalSupply',
            outputs: [{ name: '', type: 'uint256' }],
            payable: false,
            stateMutability: 'view',
            type: 'function',
          },
        ]),
        sources: JSON.stringify([
          {
            name: 'Test721.sol',
            contents: `
        // File openzeppelin-solidity/contracts/token/ERC721/ERC721Full.sol
        pragma solidity ^0.5.8; contract ERC721Full { ... }
        
        // File openzeppelin-solidity/contracts/token/ERC721/ERC721Mintable.sol
        pragma solidity ^0.5.8; contract ERC721Mintable { ... }
              `,
          },
        ]),
        timestamp: BigInt(1571256252813),
        address: '0x73c02c2a07fe2929b4da5aa5f299b5c6ea94e979',
      };
      const formattedVerification = {
        id: '5db68e277ea7c3658c3259f9',
        match: true,
        request: {
          compiler: {
            version: '0.5.8+commit.23d335f2',
          },
          language: 'Solidity',
          evmVersion: 'petersburg',
          optimizer: {
            enabled: false,
            runs: 200,
          },
          remappings: [],
          libraries: {},
        },
        result: {
          name: 'Test721',
          bytecode: '0x60806040523480156200001157600080fd',
          resultBytecode: '0x6080604052348015620000115760',
          bytecodeHash:
            '0xb9deceb4bc697123873fd29a906f6ee705b3d94d5c2eb22a34d2d2fdf4632c39',
          resultBytecodeHash:
            '0xb9deceb4bc697123873fd29a906f6ee705b3d94d5c2eb22a34d2d2fdf4632c39',
          opcodes: 'PUSH1 0x80 PUSH1 0x40',
          methodIdentifiers: {
            'name()': '06fdde03',
            'symbol()': '95d89b41',
            'totalSupply()': '18160ddd',
          },
          decodedMetadata: [
            {
              bzzr0:
                '7b86d41905245d0cddab03c40602fcba860db843231d0189039c19578fc091c3',
            },
          ],
        },
        abi: [
          {
            constant: true,
            inputs: [],
            name: 'name',
            outputs: [{ name: '', type: 'string' }],
            payable: false,
            stateMutability: 'view',
            type: 'function',
          },
          {
            constant: true,
            inputs: [],
            name: 'symbol',
            outputs: [{ name: '', type: 'string' }],
            payable: false,
            stateMutability: 'view',
            type: 'function',
          },
          {
            constant: true,
            inputs: [],
            name: 'totalSupply',
            outputs: [{ name: '', type: 'uint256' }],
            payable: false,
            stateMutability: 'view',
            type: 'function',
          },
        ],
        sources: [
          {
            file: 'ERC721Full.sol',
            content: 'pragma solidity ^0.5.8; contract ERC721Full { ... }',
          },
          {
            file: 'ERC721Mintable.sol',
            content: 'pragma solidity ^0.5.8; contract ERC721Mintable { ... }',
          },
        ],
        timestamp: BigInt(1571256252813),
        address: '0x73c02c2a07fe2929b4da5aa5f299b5c6ea94e979',
      };

      jest
        .spyOn(prisma.verification_result, 'findFirst')
        .mockResolvedValue(mockVerification);
      jest
        .spyOn(addressParser, 'formatContractVerification')
        .mockReturnValue(formattedVerification);

      const result = await service.getContractVerification(
        '0x73c02c2a07fe2929b4da5aa5f299b5c6ea94e979',
      );

      expect(result).toEqual({
        data: formattedVerification,
      });
    });

    it('should return null if contract is not verified', async () => {
      jest
        .spyOn(prisma.verification_result, 'findFirst')
        .mockResolvedValue(null);

      const result = await service.getContractVerification(
        '0x73c02c2a07fe2929b4da5aa5f299b5c6ea94e979',
      );

      expect(result).toEqual({ data: null });
    });
  });

  describe('isVerified', () => {
    it('should return true if address is verified', async () => {
      jest.spyOn(prisma.verification_result, 'findFirst').mockResolvedValue({
        id: '1',
        address: '0x73c02c2a07fe2929b4da5aa5f299b5c6ea94e979',
        match: true,
        result: '{}',
        abi: '[]',
        request: '{}',
        sources: '[]',
        timestamp: BigInt(Date.now()),
      });

      const result = await service.isVerified(
        '0x73c02c2a07fe2929b4da5aa5f299b5c6ea94e979',
      );

      expect(result).toEqual({ data: true });
    });

    it('should return false if address is not verified', async () => {
      jest
        .spyOn(prisma.verification_result, 'findFirst')
        .mockResolvedValue(null);

      const result = await service.isVerified(
        '0x73c02c2a07fe2929b4da5aa5f299b5c6ea94e979',
      );

      expect(result).toEqual({ data: false });
    });
  });
});
