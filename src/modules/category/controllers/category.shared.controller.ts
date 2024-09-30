import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import {
    PaginationQuery,
    PaginationQueryFilterInBoolean,
} from 'src/common/pagination/decorators/pagination.decorator';
import { PaginationListDto } from 'src/common/pagination/dtos/pagination.list.dto';
import { PaginationService } from 'src/common/pagination/services/pagination.service';
import { ResponsePaging } from 'src/common/response/decorators/response.decorator';
import { IResponsePaging } from 'src/common/response/interfaces/response.interface';
import { ApiKeyProtected } from 'src/modules/api-key/decorators/api-key.decorator';
import { AuthJwtAccessProtected } from 'src/modules/auth/decorators/auth.jwt.decorator';
import {
    CATEGORY_DEFAULT_AVAILABLE_SEARCH,
    CATEGORY_DEFAULT_IS_ACTIVE,
} from 'src/modules/category/constants/category.list.constant';
import { CategoryListSharedDoc } from 'src/modules/category/docs/user.shared.doc';
import { CategoryShortResponseDto } from 'src/modules/category/dtos/response/category.short.response.dto';
import { CategoryDoc } from 'src/modules/category/repository/entities/category.entity';
import { CategoryService } from 'src/modules/category/services/category.service';
import {
    PolicyAbilityProtected,
    PolicyRoleProtected,
} from 'src/modules/policy/decorators/policy.decorator';
import {
    ENUM_POLICY_ACTION,
    ENUM_POLICY_ROLE_TYPE,
    ENUM_POLICY_SUBJECT,
} from 'src/modules/policy/enums/policy.enum';

@ApiTags('modules.shared.user')
@Controller({
    version: '1',
    path: '/categories',
})
export class CategorySharedController {
    constructor(
        private readonly categoryService: CategoryService,
        private readonly paginationService: PaginationService
    ) {}

    // region Get ALl Categories
    @CategoryListSharedDoc()
    @ResponsePaging('category.list')
    @PolicyAbilityProtected({
        subject: ENUM_POLICY_SUBJECT.CATEGORY,
        action: [ENUM_POLICY_ACTION.READ],
    })
    @PolicyRoleProtected(ENUM_POLICY_ROLE_TYPE.ADMIN)
    @AuthJwtAccessProtected()
    @ApiKeyProtected()
    @Get('/list')
    async list(
        @PaginationQuery({
            availableSearch: CATEGORY_DEFAULT_AVAILABLE_SEARCH,
        })
        { _search, _limit, _offset, _order }: PaginationListDto,
        @PaginationQueryFilterInBoolean('isActive', CATEGORY_DEFAULT_IS_ACTIVE)
        isActive: Record<string, any>
    ): Promise<IResponsePaging<CategoryShortResponseDto>> {
        const find: Record<string, any> = {
            ..._search,
            ...isActive,
        };

        const categories: CategoryDoc[] = await this.categoryService.findAll(
            find,
            {
                paging: {
                    limit: _limit,
                    offset: _offset,
                },
                order: _order,
            }
        );
        const total: number = await this.categoryService.getTotal(find);
        const totalPage: number = this.paginationService.totalPage(
            total,
            _limit
        );
        console.log(JSON.stringify(categories, null, 2));
        const mapped: CategoryShortResponseDto[] =
            await this.categoryService.mapShort(categories);

        return {
            _pagination: { total, totalPage },
            data: mapped,
        };
    }

    // endregion
}
