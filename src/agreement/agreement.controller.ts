import { Controller } from "@nestjs/common";
import { TermsAgreementService } from "./agreement.service";


@Controller('agreement')
export class TermsAgreementController
{
  constructor(
    private readonly termsAgreementService: TermsAgreementService
  ) {}

  
}