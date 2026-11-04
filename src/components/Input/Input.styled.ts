import { styled } from "styled-components";

import { field } from "../../styles/mixins";
import { theme } from "../../styles/theme";

export const StyledInput = styled.input`
    ${field}

    &::placeholder {
        color: ${theme.textSubtle};
    }
`;
