import { Test, TestingModule } from '@nestjs/testing';
import { SearchController } from './search.controller';
import { SearchService } from './search.service';
import { SearchQueryDto } from './dto/search-query.dto';
import { SearchEntityType, SearchSortBy } from '@netflix/shared-types';

describe('SearchController', () => {
  let controller: SearchController;
  let searchService: {
    search: jest.Mock;
  };

  const mockResponse = {
    query: 'matrix',
    items: [],
    total: 0,
    page: 1,
    limit: 20,
    totalPages: 0,
  };

  beforeEach(async () => {
    searchService = {
      search: jest.fn().mockResolvedValue(mockResponse),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [SearchController],
      providers: [
        {
          provide: SearchService,
          useValue: searchService,
        },
      ],
    }).compile();

    controller = module.get<SearchController>(SearchController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should delegate search query to SearchService', async () => {
    const query: SearchQueryDto = {
      q: 'matrix',
      type: SearchEntityType.ALL,
      sortBy: SearchSortBy.RELEVANCE,
      page: 1,
      limit: 20,
    };

    const result = await controller.search(query);

    expect(searchService.search).toHaveBeenCalledWith(query);
    expect(result).toEqual(mockResponse);
  });
});
