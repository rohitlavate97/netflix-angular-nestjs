import { Controller, Get, Query } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { SearchService } from './search.service';
import { SearchQueryDto } from './dto/search-query.dto';
import { SearchResultsResponseDto } from '@netflix/shared-types';

@ApiTags('Search')
@Controller('search')
export class SearchController {
  constructor(private readonly searchService: SearchService) {}

  @Get()
  @ApiOperation({
    summary: 'Search catalog',
    description: 'Multi-entity search across movies, TV series, genres, and descriptions with filtering, sorting, and pagination.',
  })
  @ApiResponse({
    status: 200,
    description: 'Search results with pagination metadata',
  })
  async search(@Query() query: SearchQueryDto): Promise<SearchResultsResponseDto> {
    return this.searchService.search(query);
  }
}
